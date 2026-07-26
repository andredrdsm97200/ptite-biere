import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRpInfo } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { rpID, rpName } = getRpInfo(req);
  const existing = await prisma.credential.findMany({ where: { userId: me.id } });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: me.username,
    userID: new TextEncoder().encode(me.id),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required", // impose Face ID / Touch ID / empreinte
    },
    excludeCredentials: existing.map((c) => ({ id: c.id })),
  });

  await prisma.user.update({ where: { id: me.id }, data: { currentChallenge: options.challenge } });

  return NextResponse.json(options);
}
