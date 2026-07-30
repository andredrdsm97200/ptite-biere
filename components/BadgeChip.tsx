import type { BadgeIconKey } from "@/lib/badges";
import { BADGE_ICON_MAP, BADGE_ICON_COLOR } from "./badgeIcons";

export default function BadgeChip({
  icon,
  title,
  sub,
}: {
  icon: BadgeIconKey;
  title: string;
  sub: string;
}) {
  const Icon = BADGE_ICON_MAP[icon];
  return (
    <div className="badge-chip">
      <div className="badge-icon" style={{ color: BADGE_ICON_COLOR[icon] }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="badge-title">{title}</p>
        <p className="badge-sub">{sub}</p>
      </div>
    </div>
  );
}
