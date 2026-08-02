"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBeer } from "./icons";

const DISMISS_KEY = "installBannerDismissedAt";
const COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000; // 5 jours

type Device = "ios" | "android" | "other";

function detectDevice(): Device {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallBanner({ pwaInstalled }: { pwaInstalled: boolean }) {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [device, setDevice] = useState<Device>("other");

  useEffect(() => {
    if (pwaInstalled) return; // déjà confirmé côté serveur, on ne vérifie même pas

    if (isStandalone()) {
      // Première détection : on confirme définitivement en base, silencieusement.
      fetch("/api/profile/mark-installed", { method: "POST" }).catch(() => {});
      return;
    }

    const dev = detectDevice();
    if (dev === "other") return; // pas de nudge "écran d'accueil" pertinent sur desktop

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < COOLDOWN_MS) return;

    setDevice(dev);
    setVisible(true);
  }, [pwaInstalled]);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setHiding(true);
    setTimeout(() => setVisible(false), 250);
  }

  if (!visible) return null;

  const copy =
    device === "ios"
      ? { sub: "Sinon les notifications ne marcheront pas — Apple l'exige sur iPhone." }
      : { sub: "Ouverture plus rapide, plein écran, et notifications plus fiables." };

  return (
    <Link href="/install" className={`install-banner ${hiding ? "hiding" : ""}`}>
      <span className="install-banner-ico">
        <IconBeer size={20} />
      </span>
      <div className="install-banner-txt">
        <strong>Installe l'appli sur ton écran d'accueil</strong>
        <span>{copy.sub}</span>
      </div>
      <button
        className="install-banner-close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDismiss();
        }}
        aria-label="Fermer"
      >
        ✕
      </button>
    </Link>
  );
}
