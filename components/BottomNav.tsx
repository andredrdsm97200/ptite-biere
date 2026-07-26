"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconBeer, IconMegaphone, IconUsers, IconTrophy } from "./icons";

const tabs = [
  { href: "/", Icon: IconBeer, label: "Accueil", badgeKey: "invites" as const },
  { href: "/invite/new", Icon: IconMegaphone, label: "Inviter", badgeKey: null },
  { href: "/friends", Icon: IconUsers, label: "Amis", badgeKey: "friendRequests" as const },
  { href: "/leaderboard", Icon: IconTrophy, label: "Classement", badgeKey: null },
];

// Viewbox fixe + preserveAspectRatio="none" : le tracé s'étire exactement
// sur la largeur réelle de la barre, donc l'encoche reste alignée avec la
// bulle (positionnée elle aussi en %) quelle que soit la taille de l'écran.
const VB_W = 400;
const VB_H = 68;
const CORNER = 32; // pilule bien arrondie
const NOTCH_HALF = 42;
const NOTCH_DEPTH = 34;

function notchPath(activeIndex: number) {
  const cx = ((activeIndex + 0.5) / tabs.length) * VB_W;
  const x1 = cx - NOTCH_HALF;
  const x2 = cx + NOTCH_HALF;
  return [
    `M${CORNER},0`,
    `L${x1},0`,
    `C${x1 + NOTCH_HALF * 0.55},0 ${cx - NOTCH_HALF * 0.35},${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}`,
    `C${cx + NOTCH_HALF * 0.35},${NOTCH_DEPTH} ${x2 - NOTCH_HALF * 0.55},0 ${x2},0`,
    `L${VB_W - CORNER},0`,
    `A${CORNER},${CORNER} 0 0 1 ${VB_W},${CORNER}`,
    `L${VB_W},${VB_H - CORNER}`,
    `A${CORNER},${CORNER} 0 0 1 ${VB_W - CORNER},${VB_H}`,
    `L${CORNER},${VB_H}`,
    `A${CORNER},${CORNER} 0 0 1 0,${VB_H - CORNER}`,
    `L0,${CORNER}`,
    `A${CORNER},${CORNER} 0 0 1 ${CORNER},0`,
    "Z",
  ].join(" ");
}

export default function BottomNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ friendRequests: 0, invites: 0 });

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/notifications/counts");
        const data = await res.json();
        if (!cancelled) setCounts(data);
      } catch {
        // silencieux : une pastille en retard n'est pas grave
      }
    }
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)))
  );

  return (
    <nav className="bottom-nav">
      <svg
        className="nav-shape-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="nav-shape" d={notchPath(activeIndex)} />
      </svg>

      <div
        className="nav-bubble"
        style={{ left: `calc(${((activeIndex + 0.5) / tabs.length) * 100}% - 29px)` }}
      />

      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        const count = tab.badgeKey ? counts[tab.badgeKey] : 0;
        const Icon = tab.Icon;
        return (
          <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
            <span className="icon" style={{ position: "relative" }}>
              <Icon />
              {count > 0 && <span className="nav-badge">{count > 9 ? "9+" : count}</span>}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
