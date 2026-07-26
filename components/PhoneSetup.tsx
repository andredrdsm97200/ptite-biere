"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PhoneSetup() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/profile/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <strong>Sois trouvable par tes potes</strong>
      <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
        Ajoute ton numéro pour que ceux qui t'ont dans leurs contacts puissent te retrouver.
      </p>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          style={{
            flex: 1,
            background: "var(--ink)",
            border: "1px solid rgba(59,42,26,0.15)",
            borderRadius: 12,
            padding: "10px 12px",
            color: "var(--foam)",
          }}
        />
        <button className="btn btn-primary btn-sm" disabled={loading || !phone.trim()}>
          Valider
        </button>
      </form>
    </div>
  );
}
