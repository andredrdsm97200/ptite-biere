"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", icon: "🍻", label: "Accueil", badgeKey: "invites" as const },
  { href: "/invite/new", icon: "📣", label: "Inviter", badgeKey: null },
  { href: "/friends", icon: "👥", label: "Amis", badgeKey: "friendRequests" as const },
  { href: "/leaderboard", icon: "🏆", label: "Classement", badgeKey: null },
];

// Viewbox fixe + preserveAspectRatio="none" : le tracé s'étire exactement
// sur la largeur réelle de la barre, donc l'encoche reste alignée avec la
// bulle (positionnée elle aussi en %) quelle que soit la taille de l'écran.
const VB_W = 400;
const VB_H = 84;
const NOTCH_R = 38;

function notchPath(activeIndex: number) {
  const cx = ((activeIndex + 0.5) / tabs.length) * VB_W;
  return `M0,0 L${cx - NOTCH_R},0 A${NOTCH_R},${NOTCH_R} 0 0 0 ${cx + NOTCH_R},0 L${VB_W},0 L${VB_W},${VB_H} L0,${VB_H} Z`;
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
        style={{ left: `calc(${((activeIndex + 0.5) / tabs.length) * 100}% - 32px)` }}
      />

      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        const count = tab.badgeKey ? counts[tab.badgeKey] : 0;
        return (
          <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
            <span className="icon" style={{ position: "relative" }}>
              {tab.icon}
              {count > 0 && <span className="nav-badge">{count > 9 ? "9+" : count}</span>}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
