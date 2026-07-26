import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const subscription = await req.json();
  await prisma.user.update({
    where: { id: me.id },
    data: { pushSubscription: JSON.stringify(subscription) },
  });

  return NextResponse.json({ ok: true });
}
