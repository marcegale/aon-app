import subprocess
import os
import sys
import json
import base64
import threading
import time
import math
import logging
import io
from logging.handlers import RotatingFileHandler
from pathlib import Path
from orchestrator import process_user_command

import numpy as np
import sounddevice as sd
import websocket
import pygame
import win32gui
import win32con
import win32api
from dotenv import load_dotenv

# -------------------------
# ENV
# -------------------------
if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent

# -------------------------
# LOGGING
# -------------------------
_log_handler = RotatingFileHandler(
    str(BASE_DIR / "charlie.log"), maxBytes=512_000, backupCount=2
)
_log_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
logging.getLogger().addHandler(_log_handler)
logging.getLogger().setLevel(logging.INFO)

if getattr(sys, "frozen", False):
    class _LogWriter(io.TextIOBase):
        def write(self, s):
            if s.strip():
                logging.info(s.rstrip())
            return len(s)
        def flush(self): pass
    sys.stdout = _LogWriter()
    sys.stderr = _LogWriter()

env_path = BASE_DIR / ".env.local"
print("Buscando .env.local en:", env_path)
print("Existe .env.local?:", env_path.exists())

load_dotenv(env_path)

CHARLIE_DEVICE_KEY = os.getenv("CHARLIE_DEVICE_KEY")
BACKEND_URL = os.getenv("BACKEND_URL", "").rstrip("/")

if not CHARLIE_DEVICE_KEY:
    raise RuntimeError(f"Falta CHARLIE_DEVICE_KEY en {env_path}")
if not BACKEND_URL:
    raise RuntimeError(f"Falta BACKEND_URL en {env_path}")

CHARLIE_USER_NAME = os.getenv("CHARLIE_USER_NAME", "tu usuario")

def fetch_realtime_token() -> str:
    import urllib.request
    import urllib.error

    url = f"{BACKEND_URL}/api/charlie/session"
    body = json.dumps({"device_key": CHARLIE_DEVICE_KEY}).encode("utf-8")

    request = urllib.request.Request(url, data=body, method="POST")
    request.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(request, timeout=15) as resp:
            data = json.loads(resp.read())
            token = data.get("client_secret")
            if not token:
                raise RuntimeError("Backend no devolvió client_secret.")
            return token
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise RuntimeError(f"Backend rechazó la sesión ({e.code}): {detail}")
    except Exception as e:
        raise RuntimeError(f"No se pudo obtener token de sesión: {e}")


# -------------------------
# CONFIG
# -------------------------
WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
SAMPLE_RATE = 24000
CHANNELS = 1
BLOCKSIZE = 2400  # ~100 ms en 24kHz
VOICE = "alloy"

def ejecutar_comando_local(texto):
    txt = texto.lower()

    # --- abrir apps ---
    if "abre chrome" in txt or "abre google chrome" in txt:
        subprocess.Popen(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
        return "Abriendo Chrome"

    if "abre vscode" in txt or "abre visual studio code" in txt:
        subprocess.Popen("code", shell=True)
        return "Abriendo VS Code"

    if "abre descargas" in txt:
        subprocess.Popen("explorer shell:Downloads", shell=True)
        return "Abriendo descargas"

    # --- guardar nota ---
    if txt.startswith("guarda nota"):
        contenido = texto.replace("guarda nota", "").strip()
        if contenido:
            with open("notas_charlie.txt", "a", encoding="utf-8") as f:
                f.write(contenido + "\n")
            return "Nota guardada"
        else:
            return "No dijiste qué guardar"

    # --- pausa ---
    if "pausa charlie" in txt or "duerme charlie" in txt:
        global conversacion_activa
        conversacion_activa = False
        return "Entrando en pausa"

    return None

FRASES_FIN = [
            "adiós",
            "adios",
            "hasta luego",
            "nos vemos",
            "gracias",
            "muchas gracias",
            "eso es todo",
            "terminamos",
            "fin",
            "chau",
            "chao",
        ]

# -------------------------
# ESTADO GLOBAL
# -------------------------
estado = "idle"   # idle | escuchando | pensando | hablando | error
ws_app = None

audio_buffer = bytearray()
audio_lock = threading.Lock()
output_stream = None

ultimo_audio_asistente = 0.0
ultimo_audio_usuario = 0.0

# Para filtrar si el turno del usuario invocó a Charlie
turno_activo = True
turno_lock = threading.Lock()
ignorar_respuesta_actual = False
conversacion_activa = False
ultimo_turno_usuario = 0.0
TIMEOUT_CONVERSACION = 15.0
primer_uso = True   # flips False on first detected speech

def set_estado(nuevo):
    global estado
    if estado != nuevo:
        estado = nuevo
        print("[ESTADO]", estado)

# -------------------------
# AUDIO INPUT
# -------------------------
def pcm16_bytes(indata: np.ndarray) -> bytes:
    audio = np.clip(indata, -1.0, 1.0)
    audio = (audio * 32767).astype(np.int16)
    return audio.tobytes()

def on_audio(indata, frames, time_info, status):
    global ws_app

    if status:
        print("AUDIO INPUT STATUS:", status)

    if ws_app is None:
        return

    try:
        chunk = pcm16_bytes(indata[:, 0])
        payload = {
            "type": "input_audio_buffer.append",
            "audio": base64.b64encode(chunk).decode("utf-8"),
        }
        ws_app.send(json.dumps(payload))
    except Exception as e:
        print("ERROR enviando audio:", e)
        set_estado("error")

# -------------------------
# AUDIO OUTPUT
# -------------------------
def audio_callback(outdata, frames, time_info, status):
    if status:
        print("AUDIO OUTPUT STATUS:", status)

    needed_bytes = frames * 2  # int16 mono = 2 bytes por sample

    with audio_lock:
        available = len(audio_buffer)

        if available >= needed_bytes:
            chunk = bytes(audio_buffer[:needed_bytes])
            del audio_buffer[:needed_bytes]
        else:
            chunk = bytes(audio_buffer)
            audio_buffer.clear()

    if len(chunk) < needed_bytes:
        chunk += b"\x00" * (needed_bytes - len(chunk))

    samples = np.frombuffer(chunk, dtype=np.int16)
    outdata[:, 0] = samples

def limpiar_audio_salida():
    with audio_lock:
        audio_buffer.clear()

# -------------------------
# SESSION
# -------------------------
def send_session_update(ws):
    payload = {
        "type": "session.update",
        "session": {
            "instructions": (
                f"Eres Charlie, el asistente personal de {CHARLIE_USER_NAME}. "
                "Responde en español, breve, claro y natural. "
                "Solo contestas cuando el usuario te invoca por tu nombre: Charlie. "
                "Si hablan contigo mientras respondes, detente y escucha. "
                "Actúa como una presencia constante, no como un chatbot verboso."
            ),
            "output_audio_format": "pcm16",
            "input_audio_transcription": {
                "model": "gpt-4o-mini-transcribe"
            },
            "turn_detection": {
                "type": "server_vad"
            }
        }
    }
    ws.send(json.dumps(payload))

# -------------------------
# WEBSOCKET EVENTS
# -------------------------
def on_open(ws):
    print("Conectado a Realtime.")
    send_session_update(ws)
    set_estado("idle")

def on_message(ws, message):
    global ultimo_audio_asistente, ultimo_audio_usuario, turno_activo, ignorar_respuesta_actual, conversacion_activa, ultimo_turno_usuario, primer_uso

    try:
        data = json.loads(message)
        event_type = data.get("type", "")

        if event_type:
            print("EVENT:", event_type)

        # Usuario empieza a hablar -> interrumpe a Charlie
        if event_type == "input_audio_buffer.speech_started":
            primer_uso = False
            ultimo_audio_usuario = time.time()
            limpiar_audio_salida()
            with turno_lock:
                turno_activo = True
                ignorar_respuesta_actual = False
            set_estado("escuchando")

        elif event_type == "input_audio_buffer.speech_stopped":
            set_estado("pensando")

        elif event_type == "conversation.item.input_audio_transcription.completed":
            text = data.get("transcript", "")
            if not text:
                return

            print(f"{CHARLIE_USER_NAME}:", text)

            txt = text.lower().strip()
            ahora = time.time()

            # ---- comandos locales (nuevo sistema) ----
            result = process_user_command(text)

            if result["handled"]:
                print("Charlie:", result["speak"])

                try:
                    ws.send(json.dumps({"type": "response.cancel"}))
                except:
                    pass

                limpiar_audio_salida()
                set_estado("idle")
                return

            contiene_charlie = "charlie" in txt
            es_frase_fin = any(frase in txt for frase in FRASES_FIN)

            # ---- cierre por voz ----
            if es_frase_fin:
                conversacion_activa = False
                ultimo_turno_usuario = 0.0

                with turno_lock:
                    turno_activo = False
                    ignorar_respuesta_actual = True

                limpiar_audio_salida()

                try:
                    ws.send(json.dumps({"type": "response.cancel"}))
                except:
                    pass

                set_estado("idle")
                print("Conversación finalizada por frase de salida.")
                return

            # ---- activación ----
            if contiene_charlie:
                conversacion_activa = True
                ultimo_turno_usuario = ahora

            permitido = contiene_charlie or conversacion_activa

            with turno_lock:
                turno_activo = permitido
                ignorar_respuesta_actual = not permitido

            if permitido:
                ultimo_turno_usuario = ahora
            else:
                print("Ignorado: conversación no activa y no contiene 'charlie'")
                limpiar_audio_salida()
                set_estado("idle")

        elif event_type == "response.text.delta":
            delta = data.get("delta", "")
            if delta:
                print(delta, end="", flush=True)

        elif event_type == "response.text.done":
            print()

        elif event_type == "response.audio.delta":
            with turno_lock:
                if ignorar_respuesta_actual:
                    return

            set_estado("hablando")
            ultimo_audio_asistente = time.time()

            chunk = base64.b64decode(data["delta"])
            with audio_lock:
                audio_buffer.extend(chunk)

        elif event_type == "response.audio.done":
            set_estado("idle")
            with turno_lock:
                turno_activo = True
                ignorar_respuesta_actual = False

        elif event_type == "response.done":
            set_estado("idle")

        elif event_type == "error":
            print("Realtime error:", data)
            set_estado("error")

    except Exception as e:
        print("ERROR procesando evento:", e)
        set_estado("error")

def on_error(ws, error):
    print("WebSocket error:", error)
    set_estado("error")

def on_close(ws, code, msg):
    print("Conexión cerrada:", code, msg)
    set_estado("error")

# -------------------------
# WS THREAD
# -------------------------
def run_ws():
    global ws_app

    while True:
        print("Solicitando sesión Realtime al backend...")
        try:
            token = fetch_realtime_token()
        except Exception as e:
            print(f"No se pudo obtener token: {e}. Reintentando en 10s...")
            time.sleep(10)
            continue

        print("Token obtenido. Conectando a Realtime...")

        headers = [
            f"Authorization: Bearer {token}",
            "OpenAI-Beta: realtime=v1",
        ]

        ws_app = websocket.WebSocketApp(
            WS_URL,
            header=headers,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
        )
        ws_app.run_forever()

        ws_app = None
        print("WebSocket cerrado. Reconectando en 5s...")
        time.sleep(5)

# -------------------------
# VISUAL (PYGAME OVERLAY)
# -------------------------
pygame.init()

W, H = 220, 220
screen = pygame.display.set_mode((W, H), pygame.NOFRAME)
pygame.display.set_caption("Charlie")

hwnd = pygame.display.get_wm_info()["window"]

# Ventana overlay topmost con transparencia
ex_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
ex_style |= win32con.WS_EX_LAYERED   # no WS_EX_TOOLWINDOW so it appears in taskbar
win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, ex_style)
win32gui.SetLayeredWindowAttributes(hwnd, win32api.RGB(0, 0, 0), 0, win32con.LWA_COLORKEY)
_sw = win32api.GetSystemMetrics(0)
_sh = win32api.GetSystemMetrics(1)
win32gui.SetWindowPos(hwnd, win32con.HWND_TOPMOST, _sw - W - 24, _sh - H - 64, W, H, win32con.SWP_SHOWWINDOW)

_font_title  = pygame.font.SysFont("segoeui", 13, bold=True)
_font_status = pygame.font.SysFont("segoeui", 11)

clock = pygame.time.Clock()
cx, cy = W // 2, H // 2
tiempo = 0.0

dragging = False
drag_offset_x = 0
drag_offset_y = 0

ondas = []
ultimo_pulso_habla = 0.0

def color_estado():
    if estado == "escuchando":
        return (80, 255, 140)   # verde
    if estado == "pensando":
        return (120, 160, 255)  # azul
    if estado == "hablando":
        return (200, 240, 255)  # glow fuerte
    if estado == "error":
        return (255, 70, 70)    # rojo
    return (90, 220, 255)       # idle

def lanzar_onda():
    ondas.append([18.0, 120])

def dibujar_ondas(x, y, color):
    nuevas = []
    for r, a in ondas:
        surf = pygame.Surface((W, H), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, int(a)), (int(x), int(y)), int(r), width=2)
        screen.blit(surf, (0, 0))
        r += 2.2
        a -= 2.5
        if a > 0:
            nuevas.append([r, a])
    ondas[:] = nuevas

def dibujar_glow(x, y, radio, color, capas=10):
    for i in range(capas, 0, -1):
        r = int(radio * (i / capas))
        alpha = int(18 * (i / capas))
        surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, alpha), (r, r), r)
        screen.blit(surf, (x - r, y - r))

def dibujar_nucleo(x, y, t, color):
    # respiración suave en idle
    if estado == "idle":
        r = 10.0 + 0.8 * math.sin(t * 1.4)
    elif estado == "escuchando":
        r = 11.0 + 0.6 * math.sin(t * 2.0)
    elif estado == "pensando":
        r = 10.5 + 0.4 * math.sin(t * 3.2)
    elif estado == "hablando":
        r = 12.0 + 1.0 * math.sin(t * 5.0)
    else:
        r = 10.0

    pygame.draw.circle(screen, color, (int(x), int(y)), int(r))

    inner = pygame.Surface((40, 40), pygame.SRCALPHA)
    pygame.draw.circle(inner, (255, 255, 255, 60), (20, 20), 4)
    screen.blit(inner, (x - 20, y - 20))

def dibujar_anillos(x, y, t, color):
    for i in range(3):
        r = 28 + i * 15 + math.sin(t * 1.3 + i) * 1.4
        surf = pygame.Surface((W, H), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, 22), (int(x), int(y)), int(r), width=1)
        screen.blit(surf, (0, 0))

# -------------------------
# MAIN
# -------------------------
def main():
    global output_stream, tiempo, dragging, drag_offset_x, drag_offset_y
    global ultimo_pulso_habla, conversacion_activa, turno_activo, ignorar_respuesta_actual

    print("Charlie V4 realtime iniciado.")
    print("Di 'Charlie ...' para que responda.")
    print("Ctrl+C o clic derecho para salir.")

    ws_thread = threading.Thread(target=run_ws, daemon=True)
    ws_thread.start()

    time.sleep(2)

    output_stream = sd.OutputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="int16",
        blocksize=BLOCKSIZE,
        callback=audio_callback,
    )
    output_stream.start()

    input_stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32",
        blocksize=BLOCKSIZE,
        callback=on_audio,
    )
    input_stream.start()

    try:
        while True:
            dt = clock.tick(120) / 1000.0
            tiempo += dt

            if conversacion_activa and (time.time() - ultimo_turno_usuario > TIMEOUT_CONVERSACION):
                conversacion_activa = False
                with turno_lock:
                    turno_activo = False
                    ignorar_respuesta_actual = True
                limpiar_audio_salida()
                set_estado("idle")
                print("Conversación cerrada por silencio.")

            win32gui.SetWindowPos(
                hwnd,
                win32con.HWND_TOPMOST,
                0, 0, 0, 0,
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_NOACTIVATE
            )

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    raise KeyboardInterrupt
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:
                        dragging = True
                        mx, my = pygame.mouse.get_pos()
                        drag_offset_x = mx
                        drag_offset_y = my
                    elif event.button == 3:
                        raise KeyboardInterrupt
                elif event.type == pygame.MOUSEBUTTONUP:
                    if event.button == 1:
                        dragging = False

            if dragging:
                mx, my = win32api.GetCursorPos()
                new_x = mx - drag_offset_x
                new_y = my - drag_offset_y
                win32gui.SetWindowPos(
                    hwnd,
                    win32con.HWND_TOPMOST,
                    new_x, new_y, W, H,
                    win32con.SWP_NOACTIVATE
                )

            fx = math.sin(tiempo * 0.9) * 2.0 + math.sin(tiempo * 2.1) * 0.6
            fy = math.cos(tiempo * 0.8) * 1.8 + math.sin(tiempo * 1.7) * 0.5
            x = cx + fx
            y = cy + fy

            color = color_estado()

            if estado == "hablando":
                radio_glow = 82 + math.sin(tiempo * 2.2) * 5
                if tiempo - ultimo_pulso_habla > 0.35:
                    lanzar_onda()
                    ultimo_pulso_habla = tiempo
            elif estado == "escuchando":
                radio_glow = 72 + math.sin(tiempo * 1.6) * 3
            elif estado == "pensando":
                radio_glow = 68 + math.sin(tiempo * 1.2) * 2
            elif estado == "error":
                radio_glow = 74 + math.sin(tiempo * 4.0) * 4
            else:
                radio_glow = 62 + math.sin(tiempo * 1.0) * 2

            screen.fill((0, 0, 0))
            dibujar_glow(x, y, radio_glow, color)
            dibujar_anillos(x, y, tiempo, color)

            if estado == "hablando":
                dibujar_ondas(x, y, color)

            dibujar_nucleo(x, y, tiempo, color)

            # title
            t_surf = _font_title.render("Charlie", True, (255, 255, 255))
            screen.blit(t_surf, (W // 2 - t_surf.get_width() // 2, 14))

            # status hint / onboarding tips
            if primer_uso and estado == "idle":
                _tips = [
                    'Di "Charlie" para activarme',
                    'Di "adios" para terminar',
                    'Clic derecho para salir',
                ]
                tip = _tips[int(tiempo / 3) % len(_tips)]
                h_surf = _font_status.render(tip, True, (180, 180, 180))
            else:
                _hints = {
                    "idle":       "Di: Charlie...",
                    "escuchando": "Escuchando...",
                    "pensando":   "Pensando...",
                    "hablando":   "Hablando...",
                    "error":      "Sin conexion",
                }
                h_surf = _font_status.render(_hints.get(estado, estado), True, color)
            screen.blit(h_surf, (W // 2 - h_surf.get_width() // 2, H - 26))

            pygame.display.update()

    except KeyboardInterrupt:
        print("\nCerrando Charlie V4...")
    finally:
        try:
            input_stream.stop()
            input_stream.close()
        except Exception:
            pass

        try:
            if output_stream:
                output_stream.stop()
                output_stream.close()
        except Exception:
            pass

        pygame.quit()

if __name__ == "__main__":
    main()