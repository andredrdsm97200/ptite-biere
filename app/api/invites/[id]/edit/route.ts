import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const invite = await prisma.invite.findUnique({ where: { id: params.id } });
  if (!invite) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (invite.hostId !== me.id) {
    return NextResponse.json({ error: "Seul l'hôte peut corriger cette invitation." }, { status: 403 });
  }
  if (invite.cancelledAt) {
    return NextResponse.json({ error: "Cette invitation est annulée." }, { status: 400 });
  }

  const { message, location } = await req.json();
  const data: { message?: string; location?: string } = {};
  if (typeof message === "string" && message.trim()) data.message = message.trim().slice(0, 280);
  if (typeof location === "string" && location.trim()) data.location = location.trim().slice(0, 140);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à corriger." }, { status: 400 });
  }

  await prisma.invite.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}
