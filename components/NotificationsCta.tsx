"use client";

import { useState } from "react";
import { enablePushNotifications } from "@/lib/push-client";

export default function NotificationsCta() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleClick() {
    setStatus("loading");
    const result = await enablePushNotifications();
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "done") {
    return <div className="pill pill-cheers">🔔 Notifications activées</div>;
  }

  return (
    <div className="card">
      <div className="row">
        <div>
          <strong>Active les notifications</strong>
          <p style={{ color: "var(--foam-dim)", fontSize: 13, marginTop: 4 }}>
            Pour recevoir un "P'tite bière ?" même quand l'appli est fermée.
          </p>
        </div>
      </div>
      {status === "error" && <div className="error-banner" style={{ marginTop: 10 }}>{error}</div>}
      <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={handleClick} disabled={status === "loading"}>
        {status === "loading" ? "Activation..." : "🔔 Activer"}
      </button>
    </div>
  );
}
