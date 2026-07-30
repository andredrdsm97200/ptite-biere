type Friend = { id: string; username: string; status: "AVAILABLE" | "UNAVAILABLE" | null; avatarUrl?: string | null };

export default function AvatarRingRow({ friends }: { friends: Friend[] }) {
  const sorted = [...friends].sort((a, b) => {
    const rank = (s: Friend["status"]) => (s === "AVAILABLE" ? 0 : s === null ? 1 : 2);
    return rank(a.status) - rank(b.status);
  });

  return (
    <div className="avatar-ring-row">
      {sorted.slice(0, 10).map((f) => {
        const hot = f.status === "AVAILABLE";
        const cold = f.status === "UNAVAILABLE";
        return (
          <div key={f.id} className="avatar-ring-item" title={f.username}>
            <div
              className={`avatar-ring-circle ${hot ? "hot" : cold ? "cold" : ""}`}
              style={f.avatarUrl ? { backgroundImage: `url(${f.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!f.avatarUrl && f.username.slice(0, 1).toUpperCase()}
              {cold && <span className="avatar-ring-zzz">zZ</span>}
            </div>
          </div>
        );
      })}
      {sorted.length > 10 && <div className="avatar-ring-item avatar-ring-more">+{sorted.length - 10}</div>}
    </div>
  );
}
