"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBeer } from "./icons";

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

  if (status === "AVAILABLE") {
    return (
      <div className="cta-block">
        <button className="btn-cta-hot active" disabled={loading} onClick={() => save(null)}>
          <IconBeer size={22} /> T'ES CHAUD 🔥
        </button>
        <button className="cta-secondary" onClick={() => save(null)} disabled={loading}>
          Annuler
        </button>
      </div>
    );
  }

  if (status === "UNAVAILABLE") {
    return (
      <div className="cta-block">
        <button className="btn-cta-cold" disabled={loading} onClick={() => save(null)}>
          Pas envie aujourd'hui
        </button>
        <button className="cta-secondary" onClick={() => save("AVAILABLE")} disabled={loading}>
          Finalement, je suis chaud
        </button>
      </div>
    );
  }

  return (
    <div className="cta-block">
      <button className="btn-cta-hot" disabled={loading} onClick={() => save("AVAILABLE")}>
        <IconBeer size={22} /> JE SUIS CHAUD
      </button>
      <button className="cta-secondary" onClick={() => save("UNAVAILABLE")} disabled={loading}>
        sans moi aujourd'hui
      </button>
    </div>
  );
}
