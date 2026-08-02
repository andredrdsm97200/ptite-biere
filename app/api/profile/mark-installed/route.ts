import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  if (!me.pwaInstalled) {
    await prisma.user.update({ where: { id: me.id }, data: { pwaInstalled: true } });
  }
  return NextResponse.json({ ok: true });
}
