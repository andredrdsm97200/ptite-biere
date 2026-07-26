"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Friend = { id: string; username: string; status?: "AVAILABLE" | "UNAVAILABLE" | null };

const QUICK_MESSAGES = [
  "Je finis le taff dans 10 min, ça vous dit ?",
  "Petite soif là maintenant, qui est chaud ?",
  "Je suis déjà sur place, venez me sauver de l'ennui.",
  "Urgence bière. Aucune autre explication nécessaire.",
];

export default function InviteComposer({ friends }: { friends: Friend[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [showRecipients, setShowRecipients] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleFriend(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        location,
        showRecipients,
        recipientIds: selected,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    const data = await res.json();
    router.push(`/invite/${data.id}`);
  }

  if (friends.length === 0) {
    return (
      <div className="empty">
        Tu n'as pas encore d'amis sur l'appli. Va en ajouter dans l'onglet "Amis" avant de lancer un appel.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}

      <div className="field">
        <label>Ton message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Je finis le taff dans 10 min, rdv au bar du 16ème, à toute !"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {QUICK_MESSAGES.map((m) => (
            <button
              type="button"
              key={m}
              className="pill"
              style={{ border: "none", cursor: "pointer" }}
              onClick={() => setMessage(m)}
            >
              {m.length > 28 ? m.slice(0, 28) + "…" : m}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Où ça ?</label>
        <input
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Bar du 16ème, 12 rue de la Soif"
        />
      </div>

      <div className="section-title">À qui ?</div>
      {friends.map((f) => {
        const checked = selected.includes(f.id);
        const blocked = f.status === "UNAVAILABLE";
        return (
          <div
            key={f.id}
            className={`friend-checkbox ${checked ? "checked" : ""}`}
            style={blocked ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
            onClick={() => !blocked && toggleFriend(f.id)}
          >
            <input type="checkbox" checked={checked} disabled={blocked} readOnly />
            <span style={{ flex: 1 }}>{f.username}</span>
            {f.status === "AVAILABLE" && <span className="pill pill-cheers">🍻 chaud</span>}
            {blocked && <span className="pill pill-decline">Pas dispo aujourd'hui</span>}
          </div>
        );
      })}

      <div className="toggle-row">
        <div>
          <strong style={{ fontSize: 14 }}>Afficher la liste des invités</strong>
          <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: 0 }}>
            Sinon, chacun reçoit l'invitation sans savoir qui d'autre est invité.
          </p>
        </div>
        <div
          className={`switch ${showRecipients ? "on" : ""}`}
          onClick={() => setShowRecipients((v) => !v)}
        >
          <div className="knob" />
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={loading || selected.length === 0}>
        {loading ? "Envoi..." : `🍻 Envoyer à ${selected.length || ""} pote${selected.length > 1 ? "s" : ""}`}
      </button>
    </form>
  );
}
