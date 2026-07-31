import CollectiveChopeGauge from "./CollectiveChopeGauge";

type Friend = { id: string; username: string; status: "AVAILABLE" | "UNAVAILABLE" | null; avatarUrl?: string | null };

const DECLIC_THRESHOLD = 5;

export default function AvailabilitySummary({ friends }: { friends: Friend[] }) {
  const hot = friends.filter((f) => f.status === "AVAILABLE");

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
      <CollectiveChopeGauge hotCount={hot.length} />

      <p className="availability-count">
        <strong>{hot.length}</strong> personne{hot.length > 1 ? "s" : ""} {hot.length > 1 ? "sont" : "est"} chaude{hot.length > 1 ? "s" : ""} ce soir
      </p>
      {hot.length >= DECLIC_THRESHOLD && (
        <p className="availability-hype">🎉 C'est le moment de sortir ! 🎉</p>
      )}
    </div>
  );
}
