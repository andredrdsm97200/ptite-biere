"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CurseButton({
  inviteId,
  recipientUserId,
  alreadyCursed,
}: {
  inviteId: string;
  recipientUserId: string;
  alreadyCursed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyCursed);

  async function handleCurse() {
    if (!confirm("Maudire cette personne ? Son thème virera au poison jusqu'à demain 5h.")) return;
    setLoading(true);
    const res = await fetch(`/api/invites/${inviteId}/curse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientUserId }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  async function handleLift() {
    if (!confirm("Lever cette malédiction ? Son thème redevient normal tout de suite.")) return;
    setLoading(true);
    const res = await fetch(`/api/invites/${inviteId}/curse`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientUserId }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(false);
      router.refresh();
    }
  }

  if (done) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="pill pill-cursed">🔮 Maudit</span>
        <button className="btn-curse" disabled={loading} onClick={handleLift}>
          {loading ? "..." : "Lever"}
        </button>
      </div>
    );
  }

  return (
    <button className="btn-curse" disabled={loading} onClick={handleCurse}>
      {loading ? "..." : "🔮 Maudire"}
    </button>
  );
}
