import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRpInfo } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const credentials = await prisma.credential.findMany({ where: { userId: me.id } });
  if (credentials.length === 0) {
    return NextResponse.json({ error: "Aucune biométrie enregistrée." }, { status: 400 });
  }

  const { rpID } = getRpInfo(req);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: credentials.map((c) => ({ id: c.id })),
  });

  await prisma.user.update({ where: { id: me.id }, data: { currentChallenge: options.challenge } });

  return NextResponse.json(options);
}
