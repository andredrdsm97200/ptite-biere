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
