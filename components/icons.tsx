type IconProps = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBeer({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 9h9v10a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 6 19V9Z" />
      <path d="M15 11h1.5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H15" />
      <path d="M6 9c-.6-1.2-.4-2 .4-2.6C7.6 5.6 7.4 4.6 6.6 4" />
      <path d="M9.2 9c-.5-1.4-.2-2.2.6-2.8" />
      <path d="M12 9c-.4-1.6 0-2.4 1-3" />
    </svg>
  );
}

export function IconMegaphone({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 11v2a1 1 0 0 0 1 1h1l2.5 5.2a1 1 0 0 0 1.8-.9L7.8 14" />
      <path d="M4 11h3l9-5.5a1 1 0 0 1 1.5.86v11.3a1 1 0 0 1-1.5.85L7 13.5H4a1 1 0 0 1-1-1v-.5a1 1 0 0 1 1-1Z" />
      <path d="M19.5 9.5a3 3 0 0 1 0 5" />
    </svg>
  );
}

export function IconUsers({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 8.2a2.6 2.6 0 1 1 0 5.2" />
      <path d="M15 14.3c2.8.3 4.8 2.3 5 5.7" />
    </svg>
  );
}

export function IconTrophy({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5 3.5 3.5 0 0 0 6.5 10H7" />
      <path d="M17 5h2.5A1.5 1.5 0 0 1 21 6.5 3.5 3.5 0 0 1 17.5 10H17" />
      <path d="M12 14v3" />
      <path d="M8.5 21h7" />
      <path d="M9.5 21c0-2 1-3 2.5-3s2.5 1 2.5 3" />
    </svg>
  );
}

export function IconSleep({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="10.5" cy="12" r="6.5" />
      <path d="M8.3 10c.3-.5.9-.8 1.6-.8" />
      <path d="M8.5 15c.6.6 1.4 1 2.3 1s1.7-.4 2.3-1" />
      <path d="M17 5.5h3l-3 3h3" />
    </svg>
  );
}

export function IconPin({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21.5c4-4.2 7-7.9 7-11.5a7 7 0 1 0-14 0c0 3.6 3 7.3 7 11.5Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function IconBell({ size = 22, className, off }: IconProps & { off?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export function IconSettings({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.7 6.3l-1.7 1.7M8 16l-1.7 1.7M17.7 17.7 16 16M8 8 6.3 6.3" />
    </svg>
  );
}

export function IconPotion({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M10 3h4" />
      <path d="M10.5 3v4.2L6 15.6C4.8 17.8 6.4 20.5 9 20.5h6c2.6 0 4.2-2.7 3-4.9l-4.5-8.4V3" />
      <path d="M8.2 15.5h7.6" />
      <circle cx="11" cy="18" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFlame({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21c4 0 6.5-2.6 6.5-6 0-2.6-1.6-4-2.6-5.6-.4.9-1 1.6-1.8 2 .3-2.4-.7-5-3.1-6.9-.3 2-1 3.2-2.4 4.8C6.9 11 5.5 12.7 5.5 15c0 3.4 2.5 6 6.5 6Z" />
      <path d="M12 21c1.7 0 3-1.2 3-2.8 0-1.4-1-2.2-1.6-3.1-.5 1.4-1.7 2-1.7 2s-.6-.7-.4-1.7c-1 .8-2 1.9-2 3 0 1.4 1.2 2.6 2.7 2.6Z" />
    </svg>
  );
}

export function IconCrown({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 18h16l-1.4-8.2-4 3.4L12 6l-2.6 7.2-4-3.4L4 18Z" />
      <path d="M6 21h12" />
    </svg>
  );
}

export function IconCheck({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16 9.5" />
    </svg>
  );
}

export function IconMedal({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 3h8l-2.5 6.5h-3L8 3Z" />
      <circle cx="12" cy="14.5" r="6" />
      <path d="M12 11.5v6M9.6 13l4.8 3M14.4 13l-4.8 3" />
    </svg>
  );
}
