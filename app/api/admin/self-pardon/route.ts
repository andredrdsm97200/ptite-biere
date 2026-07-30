import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { gameDayRange } from "@/lib/gameDay";

export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  if (!isAdminUser(me)) {
    return NextResponse.json({ error: "Réservé à l'administrateur." }, { status: 403 });
  }

  const { start, end } = gameDayRange();
  await prisma.curse.deleteMany({
    where: { cursedUserId: me.id, createdAt: { gte: start, lt: end } },
  });

  return NextResponse.json({ ok: true });
}
