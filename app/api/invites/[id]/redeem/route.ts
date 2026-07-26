import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { recipientUserId } = await req.json();

  const invite = await prisma.invite.findUnique({ where: { id: params.id } });
  if (!invite) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
  if (invite.hostId !== me.id) {
    return NextResponse.json({ error: "Seul l'hôte peut valider la tournée." }, { status: 403 });
  }

  const debt = await prisma.curse.findFirst({
    where: { cursedUserId: recipientUserId, redeemed: false },
    orderBy: { createdAt: "asc" },
  });
  if (!debt) {
    return NextResponse.json({ error: "Aucune tournée en attente pour cette personne." }, { status: 404 });
  }

  await prisma.curse.update({ where: { id: debt.id }, data: { redeemed: true } });
  return NextResponse.json({ ok: true });
}
