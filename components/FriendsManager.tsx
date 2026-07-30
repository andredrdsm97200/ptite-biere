"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BadgeInline from "./BadgeInline";
import ChopeInline from "./ChopeInline";
import type { ChopeInfo } from "@/lib/chope";
import type { BadgeIconKey } from "@/lib/badges";

type Friend = { id: string; username: string; status?: "AVAILABLE" | "UNAVAILABLE" | null };
type Pending = { friendshipId: string; id: string; username: string };
type BadgeIcon = { icon: BadgeIconKey; title: string };

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
  const [search, setSearch] = useState("");
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

  async function removeFriend(friendId: string, username: string) {
    if (!confirm(`Retirer ${username} de tes amis ?`)) return;
    await fetch("/api/friends/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    router.refresh();
  }

  const filteredAccepted = accepted.filter((f) =>
    f.username.toLowerCase().includes(search.trim().toLowerCase())
  );

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
      {accepted.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Chercher un ami..."
          style={{
            width: "100%",
            background: "var(--ink-2)",
            border: "1px solid rgba(242,238,230,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
            color: "var(--foam)",
            marginBottom: 10,
          }}
        />
      )}
      {accepted.length === 0 && <div className="empty">Pas encore d'amis ici. Ajoute-en un pour lancer ta première tournée.</div>}
      {accepted.length > 0 && filteredAccepted.length === 0 && (
        <div className="empty">Aucun ami ne correspond à "{search}".</div>
      )}
      {filteredAccepted.length > 0 && (
        <div className="card" style={{ padding: "2px 14px" }}>
          {filteredAccepted.map((f) => (
            <div key={f.id} className="list-row">
              <span>
                <ChopeInline chope={chopeMap[f.id]} seed={f.id} />
                <Link href={`/u/${f.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {f.username}
                </Link>
                <BadgeInline badges={badgeMap[f.id]} />
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {f.status === "AVAILABLE" && <span className="pill pill-cheers">🍻 chaud</span>}
                {f.status === "UNAVAILABLE" && <span className="pill pill-decline">🙅 pas envie</span>}
                <button
                  onClick={() => removeFriend(f.id, f.username)}
                  className="link-muted"
                  style={{ fontSize: 16, textDecoration: "none" }}
                  title="Retirer de mes amis"
                >
                  •••
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
