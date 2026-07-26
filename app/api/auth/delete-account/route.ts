import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { password } = await req.json();
  const valid = await bcrypt.compare(password || "", me.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const hostedInvites = await prisma.invite.findMany({
    where: { hostId: me.id },
    select: { id: true },
  });
  const hostedInviteIds = hostedInvites.map((i) => i.id);

  await prisma.$transaction([
    // Malédictions liées à mes invitations, ou données/reçues ailleurs.
    prisma.curse.deleteMany({
      where: {
        OR: [
          { inviteId: { in: hostedInviteIds } },
          { cursedUserId: me.id },
          { cursedByUserId: me.id },
        ],
      },
    }),
    // Toutes les réponses (miennes, ou sur mes propres invitations).
    prisma.inviteRecipient.deleteMany({
      where: { OR: [{ userId: me.id }, { inviteId: { in: hostedInviteIds } }] },
    }),
    prisma.invite.deleteMany({ where: { hostId: me.id } }),
    prisma.statusLog.deleteMany({ where: { userId: me.id } }),
    prisma.credential.deleteMany({ where: { userId: me.id } }),
    prisma.friendship.deleteMany({ where: { OR: [{ userAId: me.id }, { userBId: me.id }] } }),
    prisma.user.delete({ where: { id: me.id } }),
  ]);

  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
