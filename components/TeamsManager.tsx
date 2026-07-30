"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Friend = { id: string; username: string };
type TeamData = { id: string; name: string; icon: string; favorite: boolean; members: { userId: string }[] };

const ICON_CHOICES = ["🍺", "💼", "⚽", "🎮", "🏖", "🎉", "👨‍👩‍👧", "🎓"];

export default function TeamsManager({ teams, friends }: { teams: TeamData[]; friends: Friend[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setName("");
    setIcon(ICON_CHOICES[0]);
    setSelected([]);
    setError("");
  }

  function startEdit(team: TeamData) {
    setEditingId(team.id);
    setCreating(false);
    setName(team.name);
    setIcon(team.icon);
    setSelected(team.members.map((m) => m.userId));
    setError("");
  }

  function toggleMember(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Donne un nom à ta Team.");
      return;
    }
    setLoading(true);
    setError("");
    if (editingId) {
      await fetch(`/api/teams/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, memberIds: selected }),
      });
    } else {
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, memberIds: selected }),
      });
    }
    setLoading(false);
    setCreating(false);
    setEditingId(null);
    router.refresh();
  }

  async function toggleFavorite(team: TeamData) {
    await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !team.favorite }),
    });
    router.refresh();
  }

  async function handleDelete(teamId: string) {
    if (!confirm("Supprimer cette Team ? Tes amis n'en seront pas affectés.")) return;
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
    router.refresh();
  }

  const isEditing = creating || !!editingId;

  return (
    <div>
      {!isEditing && (
        <>
          {teams.map((t) => (
            <div key={t.id} className="card row">
              <span style={{ cursor: "pointer" }} onClick={() => startEdit(t)}>
                {t.icon} {t.name} <span className="pill">{t.members.length}</span>
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  onClick={() => toggleFavorite(t)}
                  className="link-muted"
                  style={{ fontSize: 16, textDecoration: "none" }}
                  title="Favorite"
                >
                  {t.favorite ? "⭐" : "☆"}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="link-muted"
                  style={{ fontSize: 16, textDecoration: "none" }}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={startCreate}>
            + Créer une Team
          </button>
        </>
      )}

      {isEditing && (
        <div className="card">
          {error && <div className="error-banner">{error}</div>}
          <div className="field">
            <label>Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Les copains" />
          </div>
          <div className="field">
            <label>Icône</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className="pill"
                  style={{
                    border: ic === icon ? "1px solid var(--amber)" : "1px solid transparent",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: "6px 10px",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="section-title" style={{ marginTop: 14 }}>Membres</div>
          {friends.length === 0 && <p className="empty">Ajoute des amis d'abord.</p>}
          {friends.map((f) => {
            const checked = selected.includes(f.id);
            return (
              <div
                key={f.id}
                className={`friend-checkbox ${checked ? "checked" : ""}`}
                onClick={() => toggleMember(f.id)}
              >
                <input type="checkbox" checked={checked} readOnly />
                <span>{f.username}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" disabled={loading} onClick={handleSave}>
              {loading ? "..." : "Enregistrer"}
            </button>
            <button className="btn btn-secondary" onClick={() => { setCreating(false); setEditingId(null); }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
