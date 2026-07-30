import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const MAX_LENGTH = 400_000; // ~400 Ko en base64, largement assez pour une vignette 200x200

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { avatarUrl } = await req.json();
  if (typeof avatarUrl !== "string" || !avatarUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Image invalide." }, { status: 400 });
  }
  if (avatarUrl.length > MAX_LENGTH) {
    return NextResponse.json({ error: "Image trop lourde, réessaie." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: me.id }, data: { avatarUrl } });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  await prisma.user.update({ where: { id: me.id }, data: { avatarUrl: null } });
  return NextResponse.json({ ok: true });
}
