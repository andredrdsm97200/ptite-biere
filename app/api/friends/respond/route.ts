import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { friendshipId, accept } = await req.json();
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });

  if (!friendship || (friendship.userAId !== me.id && friendship.userBId !== me.id)) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
  if (friendship.requestedBy === me.id) {
    return NextResponse.json(
      { error: "Tu ne peux pas répondre à ta propre demande." },
      { status: 400 }
    );
  }

  if (accept) {
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }

  return NextResponse.json({ ok: true });
}
