import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team || team.ownerId !== me.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const { name, icon, favorite, memberIds } = await req.json();
  const data: { name?: string; icon?: string; favorite?: boolean } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof icon === "string") data.icon = icon;
  if (typeof favorite === "boolean") data.favorite = favorite;

  if (Array.isArray(memberIds)) {
    const friendships = await prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ userAId: me.id }, { userBId: me.id }] },
    });
    const friendIds = new Set(
      friendships.map((f) => (f.userAId === me.id ? f.userBId : f.userAId))
    );
    const validMemberIds = memberIds.filter((id: string) => friendIds.has(id));

    await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
    await prisma.teamMember.createMany({
      data: validMemberIds.map((userId: string) => ({ teamId: team.id, userId })),
    });
  }

  if (Object.keys(data).length > 0) {
    await prisma.team.update({ where: { id: team.id }, data });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team || team.ownerId !== me.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
  await prisma.team.delete({ where: { id: team.id } });
  return NextResponse.json({ ok: true });
}
