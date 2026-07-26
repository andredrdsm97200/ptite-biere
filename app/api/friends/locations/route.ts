import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
  });

  const points = friendships
    .map((f) => (f.userAId === me.id ? f.userB : f.userA))
    .filter(
      (u) =>
        effectiveDrinkStatus(u.drinkStatus, u.drinkStatusDate) === "AVAILABLE" &&
        u.latitude != null &&
        u.longitude != null
    )
    .map((u) => ({ id: u.id, username: u.username, lat: u.latitude, lng: u.longitude }));

  // On inclut aussi sa propre position, si on est soi-même "chaud" et localisé,
  // pour que la carte se centre naturellement sur soi.
  const myEffective = effectiveDrinkStatus(me.drinkStatus, me.drinkStatusDate);
  const me_point =
    myEffective === "AVAILABLE" && me.latitude != null && me.longitude != null
      ? { id: me.id, username: me.username, lat: me.latitude, lng: me.longitude, self: true }
      : null;

  return NextResponse.json({ points, me: me_point });
}
