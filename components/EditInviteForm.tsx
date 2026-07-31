"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditInviteForm({ inviteId, message, location }: { inviteId: string; message: string; location: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(message);
  const [loc, setLoc] = useState(location);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/invites/${inviteId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, location: loc }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button className="org-btn" onClick={() => setEditing(true)}>
        ✏️ Corriger
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {error && <div className="error-banner">{error}</div>}
      <div className="field">
        <label>Message</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} />
      </div>
      <div className="field">
        <label>Lieu</label>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="org-btn" disabled={loading} onClick={handleSave}>
          {loading ? "..." : "Enregistrer"}
        </button>
        <button className="org-btn" onClick={() => setEditing(false)}>
          Annuler
        </button>
      </div>
    </div>
  );
}
