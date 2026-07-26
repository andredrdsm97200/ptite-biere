export default function BadgeChip({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="badge-chip">
      <div className="badge-icon">{icon}</div>
      <div>
        <p className="badge-title">{title}</p>
        <p className="badge-sub">{sub}</p>
      </div>
    </div>
  );
}
