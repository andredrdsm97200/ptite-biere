import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "ptite_biere_session";

export function signSession(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user;
  } catch {
    return null;
  }
}
