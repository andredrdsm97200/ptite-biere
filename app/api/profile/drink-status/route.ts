import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gameDayKey } from "@/lib/gameDay";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { status } = await req.json();
  if (status !== "AVAILABLE" && status !== "UNAVAILABLE" && status !== null) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      drinkStatus: status,
      drinkStatusDate: status ? new Date() : null,
    },
  });

  // On journalise le statut du jour (utilisé pour les séries et le
  // classement "le moins chaud") — seulement quand un vrai choix est fait,
  // pas quand on revient au neutre.
  if (status === "AVAILABLE" || status === "UNAVAILABLE") {
    const gameDay = gameDayKey();
    await prisma.statusLog.upsert({
      where: { userId_gameDay: { userId: me.id, gameDay } },
      update: { status },
      create: { userId: me.id, gameDay, status },
    });
  }

  return NextResponse.json({ ok: true, status });
}
