import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendPush } from "@/lib/push";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
  });

  const accepted = friendships
    .filter((f) => f.status === "ACCEPTED")
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { id: friend.id, username: friend.username };
    });

  const incoming = friendships
    .filter((f) => f.status === "PENDING" && f.requestedBy !== me.id)
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { friendshipId: f.id, id: friend.id, username: friend.username };
    });

  const outgoing = friendships
    .filter((f) => f.status === "PENDING" && f.requestedBy === me.id)
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { friendshipId: f.id, id: friend.id, username: friend.username };
    });

  return NextResponse.json({ accepted, incoming, outgoing });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { username } = await req.json();
  const target = await prisma.user.findUnique({ where: { username } });

  if (!target) {
    return NextResponse.json({ error: "Ce pseudo n'existe pas." }, { status: 404 });
  }
  if (target.id === me.id) {
    return NextResponse.json(
      { error: "Tu ne peux pas t'ajouter toi-même." },
      { status: 400 }
    );
  }

  const [userAId, userBId] = [me.id, target.id].sort();
  const existing = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Une relation existe déjà avec cette personne." },
      { status: 409 }
    );
  }

  await prisma.friendship.create({
    data: { userAId, userBId, requestedBy: me.id, status: "PENDING" },
  });

  if (target.pushSubscription) {
    await sendPush(target.pushSubscription, {
      title: "Nouvelle demande d'ami 👋",
      body: `${me.username} veut te rejoindre sur P'tite bière !`,
      url: "/friends",
    });
  }

  return NextResponse.json({ ok: true });
}
