import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { recipientUserId } = await req.json();

  const invite = await prisma.invite.findUnique({
    where: { id: params.id },
    include: { recipients: true },
  });
  if (!invite) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
  if (invite.hostId !== me.id) {
    return NextResponse.json({ error: "Seul l'hôte peut maudire un invité." }, { status: 403 });
  }
  const isRecipient = invite.recipients.some((r) => r.userId === recipientUserId);
  if (!isRecipient) {
    return NextResponse.json({ error: "Cette personne n'était pas invitée." }, { status: 400 });
  }
  if (recipientUserId === me.id) {
    return NextResponse.json({ error: "Tu ne peux pas te maudire toi-même." }, { status: 400 });
  }

  const existing = await prisma.curse.findUnique({
    where: { inviteId_cursedUserId: { inviteId: invite.id, cursedUserId: recipientUserId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Déjà maudit pour cette invitation." }, { status: 409 });
  }

  await prisma.curse.create({
    data: { inviteId: invite.id, cursedUserId: recipientUserId, cursedByUserId: me.id },
  });

  return NextResponse.json({ ok: true });
}
