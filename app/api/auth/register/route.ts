import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const { username, email, password, phone, ref } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit faire au moins 6 caractères." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ce nom d'utilisateur ou cet e-mail est déjà pris." },
      { status: 409 }
    );
  }

  let normalizedPhone: string | null = null;
  if (phone) {
    normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      const phoneTaken = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (phoneTaken) {
        return NextResponse.json(
          { error: "Ce numéro de téléphone est déjà associé à un compte." },
          { status: 409 }
        );
      }
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, phone: normalizedPhone, passwordHash },
  });

  // Inscription via un lien d'invitation personnel (?ref=pseudo) : on crée
  // directement une amitié acceptée, sans passer par une demande.
  if (ref && typeof ref === "string") {
    const referrer = await prisma.user.findUnique({ where: { username: ref } });
    if (referrer && referrer.id !== user.id) {
      const [userAId, userBId] = [referrer.id, user.id].sort();
      const existingFriendship = await prisma.friendship.findUnique({
        where: { userAId_userBId: { userAId, userBId } },
      });
      if (!existingFriendship) {
        await prisma.friendship.create({
          data: { userAId, userBId, requestedBy: referrer.id, status: "ACCEPTED" },
        });
      }
    }
  }

  const token = signSession(user.id);
  setSessionCookie(token);

  return NextResponse.json({ id: user.id, username: user.username });
}
