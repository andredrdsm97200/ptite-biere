import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const invite = await prisma.invite.findUnique({
    where: { id: params.id },
    include: { host: true, recipients: { include: { user: true } } },
  });
  if (!invite) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });

  const isHost = invite.hostId === me.id;
  const myReceipt = invite.recipients.find((r) => r.userId === me.id);
  if (!isHost && !myReceipt) {
    return NextResponse.json({ error: "Cette invitation ne te concerne pas." }, { status: 403 });
  }

  // Marque comme "vu" au premier chargement.
  if (myReceipt && myReceipt.status === "SENT") {
    await prisma.inviteRecipient.update({
      where: { id: myReceipt.id },
      data: { status: "SEEN" },
    });
    myReceipt.status = "SEEN";
  }

  return NextResponse.json({
    id: invite.id,
    message: invite.message,
    location: invite.location,
    createdAt: invite.createdAt,
    isHost,
    host: { id: invite.host.id, username: invite.host.username },
    myStatus: myReceipt?.status ?? (isHost ? null : "SENT"),
    recipients:
      invite.showRecipients || isHost
        ? invite.recipients.map((r) => ({ username: r.user.username, status: r.status }))
        : null,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { status, note, noteVisibility } = await req.json();
  if (!["JOINED", "DECLINED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const receipt = await prisma.inviteRecipient.findUnique({
    where: { inviteId_userId: { inviteId: params.id, userId: me.id } },
  });
  if (!receipt) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const data: { status: string; note?: string | null; noteVisibility?: string | null } = { status };
  if (status === "CANCELLED") {
    data.note = note?.trim() ? note.trim().slice(0, 280) : null;
    data.noteVisibility = noteVisibility === "PUBLIC" ? "PUBLIC" : "HOST";
  }

  await prisma.inviteRecipient.update({ where: { id: receipt.id }, data });
  return NextResponse.json({ ok: true });
}
