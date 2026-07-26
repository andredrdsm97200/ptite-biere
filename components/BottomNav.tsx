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
