"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BadgeInline from "./BadgeInline";
import ChopeInline from "./ChopeInline";
import type { ChopeInfo } from "@/lib/chope";

type Friend = { id: string; username: string; status?: "AVAILABLE" | "UNAVAILABLE" | null };
type Pending = { friendshipId: string; id: string; username: string };
type BadgeIcon = { icon: string; title: string };

export default function FriendsManager({
  accepted,
  incoming,
  outgoing,
  badgeMap = {},
  chopeMap = {},
}: {
  accepted: Friend[];
  incoming: Pending[];
  outgoing: Pending[];
  badgeMap?: Record<string, BadgeIcon[]>;
  chopeMap?: Record<string, ChopeInfo>;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    setUsername("");
    router.refresh();
  }

  async function respond(friendshipId: string, accept: boolean) {
    await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, accept }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="card">
        <label style={{ fontSize: 13, color: "var(--foam-dim)", display: "block", marginBottom: 6 }}>
          Ajouter un ami par pseudo
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="pseudo de ton pote"
            style={{
              flex: 1,
              background: "var(--ink)",
              border: "1px solid rgba(242,238,230,0.12)",
              borderRadius: 12,
              padding: "10px 12px",
              color: "var(--foam)",
            }}
          />
          <button className="btn btn-primary btn-sm" disabled={loading || !username.trim()}>
            Ajouter
          </button>
        </div>
        {error && <div className="error-banner" style={{ marginTop: 10 }}>{error}</div>}
      </form>

      {incoming.length > 0 && (
        <>
          <div className="section-title">Demandes reçues</div>
          {incoming.map((f) => (
            <div key={f.friendshipId} className="card row">
              <span>{f.username}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => respond(f.friendshipId, true)}>
                  Accepter
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => respond(f.friendshipId, false)}>
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {outgoing.length > 0 && (
        <>
          <div className="section-title">Demandes envoyées</div>
          {outgoing.map((f) => (
            <div key={f.friendshipId} className="card row">
              <span>{f.username}</span>
              <span className="pill">En attente</span>
            </div>
          ))}
        </>
      )}

      <div className="section-title">Tes amis ({accepted.length})</div>
      {accepted.length === 0 && <div className="empty">Pas encore d'amis ici. Ajoute-en un pour lancer ta première tournée.</div>}
      {accepted.map((f) => (
        <div key={f.id} className="card row">
          <span>
            <ChopeInline chope={chopeMap[f.id]} seed={f.id} />
            <Link href={`/u/${f.username}`} style={{ textDecoration: "none", color: "inherit" }}>
              {f.username}
            </Link>
            <BadgeInline badges={badgeMap[f.id]} />
          </span>
          {f.status === "AVAILABLE" && <span className="pill pill-cheers">🍻 chaud</span>}
          {f.status === "UNAVAILABLE" && <span className="pill pill-decline">🙅 pas envie</span>}
        </div>
      ))}
    </div>
  );
}
