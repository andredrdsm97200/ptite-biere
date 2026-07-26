"use client";

import { useEffect } from "react";

// Enregistre le service worker dès que l'appli se charge, pour tout le monde.
// L'abonnement effectif aux notifications (permission navigateur) se fait
// via le bouton "Activer les notifications" du tableau de bord.
export default function PushManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Échec d'enregistrement du service worker :", err);
      });
    }
  }, []);

  return null;
}
