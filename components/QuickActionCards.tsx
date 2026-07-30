import Link from "next/link";
import { IconPin, IconUsers } from "./icons";

type Friend = { id: string; username: string; status: "AVAILABLE" | "UNAVAILABLE" | null; avatarUrl?: string | null };

export default function QuickActionCards({ friends }: { friends: Friend[] }) {
  const preview = [...friends]
    .sort((a, b) => {
      const rank = (s: Friend["status"]) => (s === "AVAILABLE" ? 0 : s === null ? 1 : 2);
      return rank(a.status) - rank(b.status);
    })
    .slice(0, 5);

  return (
    <div className="quick-cards">
      <Link href="/invite/new" className="quick-card">
        <div className="quick-card-icon">
          <IconPin size={15} />
        </div>
        <h3>Organiser</h3>
        <p>Un lieu, un message, et c'est parti !</p>
        <div className="quick-card-visual" />
      </Link>

      <Link href="/friends" className="quick-card">
        <div className="quick-card-icon blue">
          <IconUsers size={15} />
        </div>
        <h3>Qui est chaud</h3>
        <p>Les motivés en un coup d'œil.</p>
        <div className="quick-mini-avatars">
          {preview.map((f) => (
            <div
              key={f.id}
              className={`quick-mini-avatar ${f.status === "AVAILABLE" ? "hot" : f.status === "UNAVAILABLE" ? "cold" : ""}`}
              style={f.avatarUrl ? { backgroundImage: `url(${f.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              title={f.username}
            >
              {!f.avatarUrl && f.username.slice(0, 1).toUpperCase()}
            </div>
          ))}
          {friends.length === 0 && <span className="quick-card-empty">Ajoute des amis</span>}
        </div>
      </Link>
    </div>
  );
}
