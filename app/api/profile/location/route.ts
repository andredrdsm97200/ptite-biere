import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { latitude, longitude } = await req.json();
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Coordonnées invalides." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { latitude, longitude, locationUpdatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

// Retirer sa position (ex : on désactive "Chaud" avant la fin de la journée).
export async function DELETE() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  await prisma.user.update({
    where: { id: me.id },
    data: { latitude: null, longitude: null, locationUpdatedAt: null },
  });

  return NextResponse.json({ ok: true });
}
