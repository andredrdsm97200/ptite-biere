export default function BadgeInline({ badges }: { badges?: { icon: string; title: string }[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <span style={{ marginLeft: 6, display: "inline-flex", gap: 2 }}>
      {badges.map((b, i) => (
        <span key={i} title={b.title} style={{ fontSize: 13 }}>
          {b.icon}
        </span>
      ))}
    </span>
  );
}
