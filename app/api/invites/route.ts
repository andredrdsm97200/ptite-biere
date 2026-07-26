import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendPush } from "@/lib/push";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const sent = await prisma.invite.findMany({
    where: { hostId: me.id },
    orderBy: { createdAt: "desc" },
    include: { recipients: { include: { user: true } } },
  });

  const receivedRows = await prisma.inviteRecipient.findMany({
    where: { userId: me.id },
    include: { invite: { include: { host: true } } },
    orderBy: { invite: { createdAt: "desc" } },
  });

  return NextResponse.json({
    sent,
    received: receivedRows.map((r) => ({
      recipientStatus: r.status,
      invite: r.invite,
    })),
  });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { message, location, recipientIds, showRecipients } = await req.json();

  if (!message?.trim() || !location?.trim()) {
    return NextResponse.json(
      { error: "Le message et le lieu sont obligatoires." },
      { status: 400 }
    );
  }
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json(
      { error: "Choisis au moins un pote à inviter." },
      { status: 400 }
    );
  }

  // On vérifie que chaque destinataire est bien un ami accepté.
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ userAId: me.id }, { userBId: me.id }],
    },
  });
  const friendIds = new Set(
    friendships.map((f) => (f.userAId === me.id ? f.userBId : f.userAId))
  );
  const candidateIds = recipientIds.filter((id: string) => friendIds.has(id));

  if (candidateIds.length === 0) {
    return NextResponse.json(
      { error: "Aucun destinataire valide (vérifie que ce sont bien des amis)." },
      { status: 400 }
    );
  }

  // On exclut tout ami ayant déclaré ne pas être disponible aujourd'hui,
  // même si la requête essaie de le forcer.
  const candidates = await prisma.user.findMany({ where: { id: { in: candidateIds } } });
  const validRecipientIds = candidates
    .filter((u) => effectiveDrinkStatus(u.drinkStatus, u.drinkStatusDate) !== "UNAVAILABLE")
    .map((u) => u.id);

  if (validRecipientIds.length === 0) {
    return NextResponse.json(
      { error: "Ces amis ont indiqué ne pas être disponibles aujourd'hui." },
      { status: 400 }
    );
  }

  const invite = await prisma.invite.create({
    data: {
      hostId: me.id,
      message: message.trim(),
      location: location.trim(),
      showRecipients: !!showRecipients,
      recipients: {
        create: validRecipientIds.map((userId: string) => ({ userId })),
      },
    },
    include: { recipients: { include: { user: true } } },
  });

  // Envoi des notifications push à chaque destinataire qui y est abonné.
  const recipientsUsers = await prisma.user.findMany({
    where: { id: { in: validRecipientIds } },
  });

  await Promise.all(
    recipientsUsers
      .filter((u) => !!u.pushSubscription)
      .map((u) =>
        sendPush(u.pushSubscription as string, {
          title: "P'tite bière ? 🍺",
          body: `${me.username} t'invite : "${message.trim().slice(0, 80)}"`,
          url: `/invite/${invite.id}`,
        })
      )
  );

  return NextResponse.json({ id: invite.id });
}
