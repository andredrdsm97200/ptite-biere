"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Rafraîchit les données serveur en tâche de fond, pour que les nouvelles
// invitations / réponses des potes apparaissent sans recharger la page.
export default function AutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
