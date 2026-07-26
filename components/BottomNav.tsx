"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "🍻", label: "Accueil" },
  { href: "/invite/new", icon: "📣", label: "Inviter" },
  { href: "/friends", icon: "👥", label: "Amis" },
  { href: "/leaderboard", icon: "🏆", label: "Classement" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
            <span className="icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
