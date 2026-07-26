"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBeer, IconSleep } from "./icons";

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
    <div className="mood-picker">
      <p className="mood-picker-label">Envie de boire aujourd'hui ?</p>
      <div className="mood-picker-track">
        <div
          className={`mood-picker-fill ${status === "AVAILABLE" ? "hot" : status === "UNAVAILABLE" ? "cold" : "neutral"}`}
        />
        <button
          className={`mood-picker-btn ${status === "AVAILABLE" ? "active" : ""}`}
          disabled={loading}
          onClick={() => save(status === "AVAILABLE" ? null : "AVAILABLE")}
        >
          <IconBeer size={18} />
          Chaud
        </button>
        <button
          className={`mood-picker-btn ${status === "UNAVAILABLE" ? "active" : ""}`}
          disabled={loading}
          onClick={() => save(status === "UNAVAILABLE" ? null : "UNAVAILABLE")}
        >
          <IconSleep size={18} />
          Pas envie
        </button>
      </div>
    </div>
  );
}
