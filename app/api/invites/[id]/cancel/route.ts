import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendPush } from "@/lib/push";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const invite = await prisma.invite.findUnique({
    where: { id: params.id },
    include: { recipients: { include: { user: true } } },
  });
  if (!invite) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
  if (invite.hostId !== me.id) {
    return NextResponse.json({ error: "Seul l'hôte peut annuler ce plan." }, { status: 403 });
  }
  if (invite.cancelledAt) {
    return NextResponse.json({ error: "Déjà annulé." }, { status: 409 });
  }

  await prisma.invite.update({ where: { id: invite.id }, data: { cancelledAt: new Date() } });

  // On prévient uniquement ceux qui n'avaient pas déjà décliné/annulé de leur côté.
  const toNotify = invite.recipients.filter((r) => !["DECLINED", "CANCELLED"].includes(r.status));
  await Promise.all(
    toNotify
      .filter((r) => !!r.user.pushSubscription)
      .map((r) =>
        sendPush(r.user.pushSubscription as string, {
          title: "Plan annulé 😢",
          body: `${me.username} a annulé : "${invite.location}"`,
          url: `/invite/${invite.id}`,
        })
      )
  );

  return NextResponse.json({ ok: true });
}
