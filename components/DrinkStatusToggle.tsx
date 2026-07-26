"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "AVAILABLE" | "UNAVAILABLE" | null;

export default function DrinkStatusToggle({ initialStatus }: { initialStatus: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  async function save(next: Status) {
    const previous = status;
    setStatus(next);
    setLocationNote("");
    setLoading(true);

    const res = await fetch("/api/profile/drink-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) {
      setStatus(previous);
      setLoading(false);
      return;
    }

    if (next === "AVAILABLE") {
      // Position capturée une seule fois (pas de suivi en continu), et
      // uniquement quand on se déclare "chaud" — jamais en silence.
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await fetch("/api/profile/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            });
            setLocationNote("📍 Position partagée avec tes amis tant que tu es \"chaud\".");
            setLoading(false);
            router.refresh();
          },
          () => {
            setLocationNote("Statut activé — position non partagée (autorisation refusée).");
            setLoading(false);
            router.refresh();
          }
        );
        return;
      }
    } else {
      // On retire sa position dès qu'on n'est plus "chaud".
      await fetch("/api/profile/location", { method: "DELETE" });
    }

    setLoading(false);
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
            Visible par tes potes, avec ta position exacte, tant que c'est activé.
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

      {locationNote && (
        <p style={{ fontSize: 12, color: "var(--foam-dim)", marginTop: 10, marginBottom: 0 }}>
          {locationNote}
        </p>
      )}
    </div>
  );
}
