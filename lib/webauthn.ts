import { NextRequest } from "next/server";

// L'ID du "relying party" doit être le nom d'hôte exact qui sert la page
// (sans protocole ni port) — ça marche aussi bien en local (localhost)
// qu'une fois déployé (ton-projet.vercel.app ou domaine perso).
export function getRpInfo(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const rpID = host.split(":")[0];
  const origin = `${proto}://${host}`;
  return { rpID, origin, rpName: "P'tite bière ?" };
}
