import type { BadgeIconKey } from "@/lib/badges";
import { BADGE_ICON_MAP, BADGE_ICON_COLOR } from "./badgeIcons";

export default function BadgeInline({ badges }: { badges?: { icon: BadgeIconKey; title: string }[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <span style={{ marginLeft: 6, display: "inline-flex", gap: 3, verticalAlign: "middle" }}>
      {badges.map((b, i) => {
        const Icon = BADGE_ICON_MAP[b.icon];
        return (
          <span key={i} title={b.title} style={{ color: BADGE_ICON_COLOR[b.icon], display: "inline-flex" }}>
            <Icon size={14} />
          </span>
        );
      })}
    </span>
  );
}
