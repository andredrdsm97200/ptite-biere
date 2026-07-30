"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSelfPardon() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/admin/self-pardon", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card" style={{ border: "1px solid rgba(179,79,232,0.35)" }}>
      <strong style={{ color: "#c98ce8" }}>🔮 Admin</strong>
      <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
        Tu es actuellement maudit. En tant qu'administrateur, tu peux lever ça toi-même.
      </p>
      <button className="btn btn-secondary" disabled={loading} onClick={handleClick}>
        {loading ? "..." : "Annuler ma malédiction"}
      </button>
    </div>
  );
}
