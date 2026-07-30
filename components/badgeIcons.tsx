import { IconMedal, IconFlame, IconSleep, IconPotion } from "./icons";
import type { BadgeIconKey } from "@/lib/badges";

export const BADGE_ICON_MAP: Record<BadgeIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  host: IconMedal,
  streak: IconFlame,
  cold: IconSleep,
  cursed: IconPotion,
};

export const BADGE_ICON_COLOR: Record<BadgeIconKey, string> = {
  host: "var(--amber)",
  streak: "var(--decline)",
  cold: "var(--copper)",
  cursed: "#c98ce8",
};
