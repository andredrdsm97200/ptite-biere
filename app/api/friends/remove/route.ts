import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { friendId } = await req.json();
  const [userAId, userBId] = [me.id, friendId].sort();

  const friendship = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });
  if (!friendship || friendship.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id: friendship.id } });
  return NextResponse.json({ ok: true });
}
