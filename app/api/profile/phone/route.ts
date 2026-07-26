import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { phone } = await req.json();
  const normalized = normalizePhone(phone || "");
  if (!normalized) {
    return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone: normalized } });
  if (existing && existing.id !== me.id) {
    return NextResponse.json(
      { error: "Ce numéro est déjà utilisé par un autre compte." },
      { status: 409 }
    );
  }

  await prisma.user.update({ where: { id: me.id }, data: { phone: normalized } });
  return NextResponse.json({ ok: true, phone: normalized });
}
