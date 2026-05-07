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

  // ── Build .env.local content ─────────────────────────────────────────────
  const envContent = [
    `CHARLIE_DEVICE_KEY=${deviceKey}`,
    `BACKEND_URL=${BACKEND_URL}`,
    `CHARLIE_USER_NAME=${userName}`,
  ].join("\n") + "\n";

  // ── Build zip ────────────────────────────────────────────────────────────
  if (!fs.existsSync(EXE_PATH)) {
    console.error(`[admin/charlie/download] exe not found at ${EXE_PATH}`);
    return NextResponse.json({ error: "Exe not found on server." }, { status: 500 });
  }

  const zip = new AdmZip();
  zip.addLocalFile(EXE_PATH);
  zip.addFile(".env.local", Buffer.from(envContent, "utf8"));
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
