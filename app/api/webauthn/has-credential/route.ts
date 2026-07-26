import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ has: false });
  const count = await prisma.credential.count({ where: { userId: me.id } });
  return NextResponse.json({ has: count > 0 });
}
