import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gameDayRange } from "@/lib/gameDay";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ friendRequests: 0, invites: 0 });

  const friendRequests = await prisma.friendship.count({
    where: {
      status: "PENDING",
      requestedBy: { not: me.id },
      OR: [{ userAId: me.id }, { userBId: me.id }],
    },
  });

  const { start, end } = gameDayRange();
  const invites = await prisma.inviteRecipient.count({
    where: {
      userId: me.id,
      status: { in: ["SENT", "SEEN"] },
      invite: { createdAt: { gte: start, lt: end }, cancelledAt: null },
    },
  });

  return NextResponse.json({ friendRequests, invites });
}
