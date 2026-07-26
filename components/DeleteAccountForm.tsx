"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountForm() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  if (!confirming) {
    return (
      <div className="card">
        <strong style={{ color: "var(--decline)" }}>Zone dangereuse</strong>
        <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
          Supprime définitivement ton compte : amis, invitations, statuts, badges et
          malédictions. Impossible à annuler.
        </p>
        <button className="btn btn-danger" onClick={() => setConfirming(true)}>
          🗑️ Supprimer mon compte
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <strong style={{ color: "var(--decline)" }}>Es-tu bien sûr ?</strong>
      <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
        Confirme avec ton mot de passe. Cette action est définitive.
      </p>
      {error && <div className="error-banner">{error}</div>}
      <div className="field">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ton mot de passe"
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-danger" disabled={loading || !password} onClick={handleDelete}>
          {loading ? "Suppression..." : "Confirmer la suppression"}
        </button>
        <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
          Annuler
        </button>
      </div>
    </div>
  );
}
