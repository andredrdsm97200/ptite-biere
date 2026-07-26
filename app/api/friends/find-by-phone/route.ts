import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { phones } = await req.json();
  if (!Array.isArray(phones) || phones.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const normalized = Array.from(
    new Set(phones.map((p: string) => normalizePhone(p)).filter(Boolean))
  ) as string[];

  if (normalized.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const users = await prisma.user.findMany({
    where: { phone: { in: normalized }, NOT: { id: me.id } },
  });

  // On indique aussi, pour chaque correspondance, si c'est déjà un ami
  // ou une demande en attente, pour adapter le bouton côté interface.
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: users.map((u) => ({
        OR: [
          { userAId: me.id, userBId: u.id },
          { userAId: u.id, userBId: me.id },
        ],
      })),
    },
  });

  const matches = users.map((u) => {
    const friendship = friendships.find(
      (f) => f.userAId === u.id || f.userBId === u.id
    );
    return {
      id: u.id,
      username: u.username,
      relation: friendship ? friendship.status : "NONE",
    };
  });

  return NextResponse.json({ matches });
}
