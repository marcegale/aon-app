import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, email } = body;

    if (!id || !nombre || !email) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const leadExistente = await prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!leadExistente) {
      return NextResponse.json(
        { error: "Lead no encontrado." },
        { status: 404 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        isUnlocked: true,
        unlockedAt: new Date(),
      },
      select: {
        id: true,
        diagnosticoResumen: true,
        diagnostico: true,
        isUnlocked: true,
        nombre: true,
        email: true,
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("PATCH /api/diagnostico/unlock error:", error);

    return NextResponse.json(
      { error: "Error interno." },
      { status: 500 }
    );
  }
}