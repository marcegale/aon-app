import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const BACKEND_URL = "https://aon-app-production.up.railway.app";
const EXE_PATH = path.join(process.cwd(), "charlie-agent", "dist", "charlie_v4_realtime.exe");

function buildSetupBat(userName: string): string {
  return `@echo off
setlocal
cd /d "%~dp0"

set "INSTALL_DIR=%LOCALAPPDATA%\\Charlie"
set "EXE_NAME=charlie_v4_realtime.exe"

echo.
echo  Instalando Charlie para ${userName}...
echo.

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copying from: %~dp0
copy /Y "%~dp0\\charlie_v4_realtime.exe" "%INSTALL_DIR%\\charlie_v4_realtime.exe" >nul
copy /Y "%~dp0\\.env.local" "%INSTALL_DIR%\\.env.local" >nul

if not exist "%INSTALL_DIR%\\charlie_v4_realtime.exe" (
    echo ERROR: exe not copied. Verifica que el archivo existe junto a setup.bat.
    pause
    exit /b 1
)

echo  Archivos copiados a: %INSTALL_DIR%

set "SM_DIR=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"
powershell -NoProfile -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut('%SM_DIR%\\Charlie.lnk');$s.TargetPath='%INSTALL_DIR%\\%EXE_NAME%';$s.WorkingDirectory='%INSTALL_DIR%';$s.Description='Charlie - Asistente Personal';$s.Save()"
echo  Acceso directo creado en Inicio.

echo.
set /p "STARTUP=Iniciar Charlie automaticamente con Windows? (s/n): "
if /i "%STARTUP%"=="s" (
    reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Charlie" /t REG_SZ /d "\\"%INSTALL_DIR%\\%EXE_NAME%\\"" /f >nul
    echo  Charlie se iniciara con Windows.
) else (
    echo  Inicio automatico no configurado.
)

echo.
set /p "DESKTOP=Crear acceso directo en el Escritorio? (s/n): "
if /i "%DESKTOP%"=="s" (
    powershell -NoProfile -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut('%USERPROFILE%\\Desktop\\Charlie.lnk');$s.TargetPath='%INSTALL_DIR%\\%EXE_NAME%';$s.WorkingDirectory='%INSTALL_DIR%';$s.Save()"
    echo  Acceso directo creado en el Escritorio.
)

echo.
echo  Instalacion completada.
echo.
set /p "LAUNCH=Iniciar Charlie ahora? (s/n): "
if /i "%LAUNCH%"=="s" (
    start "" "%INSTALL_DIR%\\%EXE_NAME%"
)

endlocal
`;
}

function buildReadme(userName: string): string {
  return `Charlie — Asistente Personal para ${userName}
=============================================

INSTALACION
-----------
1. Ejecuta setup.bat (doble clic)
2. Responde las preguntas de instalacion
3. Charlie queda en: %LOCALAPPDATA%\\Charlie\\

USO
---
- Di "Charlie" para activarlo
- Di "adios" o "hasta luego" para cerrar la conversacion
- Clic derecho en la ventana para salir

La ventana de Charlie aparece en la esquina inferior derecha de la pantalla.

SOPORTE
-------
Si Charlie no arranca, revisa charlie.log en la carpeta de instalacion.
`;
}

export async function POST(req: Request) {
  // ── Admin auth ───────────────────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({})) as {
    userName?: string;
    deviceKey?: string;
  };

  const userName = (body.userName ?? "").trim();
  if (!userName) {
    return NextResponse.json({ error: "userName is required" }, { status: 400 });
  }

  const deviceKey = (body.deviceKey ?? "").trim() ||
    `charlie-${crypto.randomBytes(8).toString("hex")}`;

  // ── Create device record ─────────────────────────────────────────────────
  const device = await prisma.charlieDevice.create({
    data: { deviceKey, userName, status: "active" },
  });

  console.log(`[admin/charlie/download] created device ${device.id} for "${userName}"`);

  // ── Build .env.local ─────────────────────────────────────────────────────
  const envContent = [
    `CHARLIE_DEVICE_KEY=${deviceKey}`,
    `BACKEND_URL=${BACKEND_URL}`,
    `CHARLIE_USER_NAME=${userName}`,
  ].join("\r\n") + "\r\n";

  // ── Build zip ────────────────────────────────────────────────────────────
  if (!fs.existsSync(EXE_PATH)) {
    console.error(`[admin/charlie/download] exe not found at ${EXE_PATH}`);
    return NextResponse.json({ error: "Exe not found on server." }, { status: 500 });
  }

  const zip = new AdmZip();
  zip.addLocalFile(EXE_PATH);
  zip.addFile(".env.local",  Buffer.from(envContent, "utf8"));
  zip.addFile("setup.bat",   Buffer.from(buildSetupBat(userName), "utf8"));
  zip.addFile("README.txt",  Buffer.from(buildReadme(userName),   "utf8"));
  const zipBuffer = zip.toBuffer();

  const safeName = userName.replace(/[^a-zA-Z0-9_-]/g, "_");
  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="charlie-${safeName}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
