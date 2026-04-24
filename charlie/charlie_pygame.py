import pygame
import math
import random
import sys
import ctypes
import win32gui
import win32con
import win32api

pygame.init()

W, H = 180, 180
start_x, start_y = 1400, 700

screen = pygame.display.set_mode((W, H), pygame.NOFRAME)
pygame.display.set_caption("Charlie")

hwnd = pygame.display.get_wm_info()["window"]

ex_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
ex_style |= win32con.WS_EX_LAYERED
ex_style |= win32con.WS_EX_TOOLWINDOW
win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, ex_style)
win32gui.SetLayeredWindowAttributes(hwnd, win32api.RGB(0, 0, 0), 0, win32con.LWA_COLORKEY)

win32gui.SetWindowPos(
    hwnd,
    win32con.HWND_TOPMOST,
    start_x, start_y, W, H,
    win32con.SWP_SHOWWINDOW
)

clock = pygame.time.Clock()

cx, cy = W // 2, H // 2
tiempo = 0.0
estado = "idle"
ondas = []
ultimo_pulso_habla = 0
ultimo_click = 0

dragging = False
drag_offset_x = 0
drag_offset_y = 0

particulas = []
for _ in range(42):
    ang = random.uniform(0, math.tau)
    dist = random.uniform(24, 74)
    speed = random.uniform(0.15, 0.6)
    size = random.uniform(0.8, 1.8)
    drift = random.uniform(-0.3, 0.3)
    particulas.append([ang, dist, speed, size, drift])

def color_estado():
    if estado == "idle":
        return (90, 220, 255)
    if estado == "escuchando":
        return (80, 255, 140)
    if estado == "pensando":
        return (120, 160, 255)
    if estado == "hablando":
        return (180, 240, 255)
    if estado == "error":
        return (255, 70, 70)
    return (90, 220, 255)

def dibujar_glow(x, y, radio, color, capas=10):
    for i in range(capas, 0, -1):
        r = int(radio * (i / capas))
        alpha = int(18 * (i / capas))
        surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, alpha), (r, r), r)
        screen.blit(surf, (x - r, y - r))

def dibujar_nucleo(x, y, t, color):
    r = 10.5 + 0.9 * math.sin(t * 1.9) + 0.35 * math.sin(t * 4.8)
    pygame.draw.circle(screen, color, (int(x), int(y)), int(r))

    inner = pygame.Surface((40, 40), pygame.SRCALPHA)
    pygame.draw.circle(inner, (255, 255, 255, 60), (20, 20), 5)
    screen.blit(inner, (x - 20, y - 20))

def dibujar_anillos(x, y, t, color):
    for i in range(3):
        r = 28 + i * 16 + math.sin(t * 1.2 + i * 0.9) * 1.8
        surf = pygame.Surface((W, H), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, 26), (int(x), int(y)), int(r), width=1)
        screen.blit(surf, (0, 0))

def dibujar_particulas(x, y, t, color):
    for p in particulas:
        ang, dist, speed, size, drift = p
        ang += 0.01 * speed
        dist += math.sin(t * speed + ang) * 0.03 + drift * 0.01
        p[0] = ang
        p[1] = max(22, min(78, dist))

        px = x + math.cos(ang + t * speed) * dist
        py = y + math.sin(ang + t * speed) * dist

        alpha = 90 + int(50 * math.sin(t * 1.8 + ang))
        surf = pygame.Surface((12, 12), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, max(30, min(160, alpha))), (6, 6), max(1, int(size)))
        screen.blit(surf, (px - 6, py - 6))

def lanzar_onda():
    ondas.append([18.0, 120])

def dibujar_ondas(x, y, color):
    nuevas = []
    for r, a in ondas:
        surf = pygame.Surface((W, H), pygame.SRCALPHA)
        pygame.draw.circle(surf, (*color, int(a)), (int(x), int(y)), int(r), width=2)
        screen.blit(surf, (0, 0))
        r += 1.8
        a -= 2.3
        if a > 0:
            nuevas.append([r, a])
    ondas[:] = nuevas

while True:
    dt = clock.tick(60) / 1000
    tiempo += dt

    win32gui.SetWindowPos(
        hwnd,
        win32con.HWND_TOPMOST,
        0, 0, 0, 0,
        win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_NOACTIVATE
    )

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()
            elif event.key == pygame.K_1:
                estado = "idle"
            elif event.key == pygame.K_2:
                estado = "escuchando"
            elif event.key == pygame.K_3:
                estado = "pensando"
            elif event.key == pygame.K_4:
                estado = "hablando"
            elif event.key == pygame.K_5:
                estado = "error"
            elif event.key == pygame.K_SPACE:
                lanzar_onda()

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:
                dragging = True
                mx, my = pygame.mouse.get_pos()
                drag_offset_x = mx
                drag_offset_y = my
                ultimo_click = tiempo
            elif event.button == 3:
                pygame.quit()
                sys.exit()

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

    screen.fill((0, 0, 0))

    color = color_estado()

    fx = math.sin(tiempo * 0.9) * 2.2 + math.sin(tiempo * 2.3) * 0.6
    fy = math.cos(tiempo * 0.8) * 2.0 + math.sin(tiempo * 1.7) * 0.5

    impulso = max(0, 1 - (tiempo - ultimo_click) * 3)
    fx += math.sin(tiempo * 18) * impulso * 1.2
    fy += math.cos(tiempo * 16) * impulso * 1.2

    x = cx + fx
    y = cy + fy

    if estado == "hablando":
        if tiempo - ultimo_pulso_habla > 0.38:
            lanzar_onda()
            ultimo_pulso_habla = tiempo

    radio_glow = 72 + math.sin(tiempo * 1.4) * 2.5
    dibujar_glow(x, y, radio_glow, color)
    dibujar_ondas(x, y, color)
    dibujar_anillos(x, y, tiempo, color)
    dibujar_particulas(x, y, tiempo, color)
    dibujar_nucleo(x, y, tiempo, color)

    pygame.display.update()