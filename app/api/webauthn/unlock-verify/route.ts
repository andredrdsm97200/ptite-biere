import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRpInfo } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  if (!me.currentChallenge) {
    return NextResponse.json({ error: "Aucune demande en cours." }, { status: 400 });
  }

  const body = await req.json();
  const credential = await prisma.credential.findUnique({ where: { id: body.id } });
  if (!credential || credential.userId !== me.id) {
    return NextResponse.json({ error: "Identifiant inconnu." }, { status: 400 });
  }

  const { rpID, origin } = getRpInfo(req);

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: me.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: new Uint8Array(credential.publicKey),
        counter: Number(credential.counter),
      },
    });
  } catch {
    return NextResponse.json({ error: "Échec de la vérification." }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Échec de la vérification." }, { status: 400 });
  }

  await prisma.credential.update({
    where: { id: credential.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  });
  await prisma.user.update({ where: { id: me.id }, data: { currentChallenge: null } });

  return NextResponse.json({ ok: true });
}
