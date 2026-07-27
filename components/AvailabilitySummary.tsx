type Friend = { id: string; username: string; status: "AVAILABLE" | "UNAVAILABLE" | null };

export default function AvailabilitySummary({ friends }: { friends: Friend[] }) {
  const hot = friends.filter((f) => f.status === "AVAILABLE");
  const neutral = friends.filter((f) => f.status === null);
  const cold = friends.filter((f) => f.status === "UNAVAILABLE");

  if (friends.length === 0) {
    return (
      <div className="availability-card">
        <p className="availability-title">Qui est chaud aujourd'hui ?</p>
        <p className="empty" style={{ padding: "8px 0" }}>
          Ajoute des amis pour voir qui a envie d'une bière.
        </p>
      </div>
    );
  }

  return (
    <div className="availability-card">
      <p className="availability-title">Qui est chaud aujourd'hui ?</p>
      <div className="availability-stats">
        <div className="availability-stat hot">
          <strong>{hot.length}</strong>
          <span>🟢 chauds</span>
        </div>
        <div className="availability-stat neutral">
          <strong>{neutral.length}</strong>
          <span>⚪ non prononcés</span>
        </div>
        <div className="availability-stat cold">
          <strong>{cold.length}</strong>
          <span>🔴 pas dispo</span>
        </div>
      </div>
      {hot.length > 0 && (
        <div className="availability-names">
          {hot.slice(0, 6).map((f) => (
            <span key={f.id} className="pill pill-cheers">
              🍻 {f.username}
            </span>
          ))}
          {hot.length > 6 && <span className="pill">+{hot.length - 6}</span>}
        </div>
      )}
    </div>
  );
}
