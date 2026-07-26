"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "AVAILABLE" | "UNAVAILABLE" | null;

export default function DrinkStatusToggle({ initialStatus }: { initialStatus: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function save(next: Status) {
    const previous = status;
    setStatus(next);
    setLoading(true);
    const res = await fetch("/api/profile/drink-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (!res.ok) setStatus(previous);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="section-title" style={{ margin: 0, marginBottom: 4 }}>
        Envie de boire aujourd'hui ?
      </div>

      <div className="toggle-row">
        <div>
          <strong style={{ fontSize: 14 }}>🍻 Chaud pour une bière</strong>
          <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: 0 }}>
            Tes potes le verront quand ils lancent un appel.
          </p>
        </div>
        <div
          className={`switch switch-cheers ${status === "AVAILABLE" ? "on" : ""}`}
          onClick={() => !loading && save(status === "AVAILABLE" ? null : "AVAILABLE")}
        >
          <div className="knob" />
        </div>
      </div>

      <div className="toggle-row">
        <div>
          <strong style={{ fontSize: 14 }}>🙅 Pas envie aujourd'hui</strong>
          <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: 0 }}>
            Personne ne pourra t'inviter tant que c'est activé.
          </p>
        </div>
        <div
          className={`switch switch-decline ${status === "UNAVAILABLE" ? "on" : ""}`}
          onClick={() => !loading && save(status === "UNAVAILABLE" ? null : "UNAVAILABLE")}
        >
          <div className="knob" />
        </div>
      </div>
    </div>
  );
}
