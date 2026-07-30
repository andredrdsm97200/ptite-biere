import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const teams = await prisma.team.findMany({
    where: { ownerId: me.id },
    include: { members: true },
    orderBy: [{ favorite: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { name, icon, memberIds } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Donne un nom à ta Team." }, { status: 400 });
  }

  // On ne peut ajouter que de vrais amis acceptés.
  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: me.id }, { userBId: me.id }] },
  });
  const friendIds = new Set(
    friendships.map((f) => (f.userAId === me.id ? f.userBId : f.userAId))
  );
  const validMemberIds = Array.isArray(memberIds) ? memberIds.filter((id: string) => friendIds.has(id)) : [];

  const team = await prisma.team.create({
    data: {
      ownerId: me.id,
      name: name.trim(),
      icon: icon || "🍺",
      members: { create: validMemberIds.map((userId: string) => ({ userId })) },
    },
    include: { members: true },
  });

  return NextResponse.json({ team });
}
