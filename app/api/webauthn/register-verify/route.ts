import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRpInfo } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  if (!me.currentChallenge) {
    return NextResponse.json({ error: "Aucune demande en cours." }, { status: 400 });
  }

  const { rpID, origin } = getRpInfo(req);
  const body = await req.json();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: me.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (err) {
    return NextResponse.json({ error: "Échec de la vérification." }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Échec de la vérification." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;

  await prisma.credential.create({
    data: {
      id: credential.id,
      userId: me.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: BigInt(credential.counter),
      deviceLabel: body.deviceLabel || null,
    },
  });
  await prisma.user.update({ where: { id: me.id }, data: { currentChallenge: null } });

  return NextResponse.json({ ok: true });
}
