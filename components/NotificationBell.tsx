"use client";

import { useEffect, useState } from "react";
import { enablePushNotifications } from "@/lib/push-client";

export default function NotificationBell() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEnabled(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => setEnabled(false));
  }, []);

  async function handleClick() {
    if (enabled || loading) return;
    setLoading(true);
    const result = await enablePushNotifications();
    setLoading(false);
    setEnabled(result.ok);
  }

  if (enabled === null) return null;

  return (
    <button
      className="nav-link"
      onClick={handleClick}
      title={enabled ? "Notifications activées" : "Activer les notifications"}
      style={{ background: "none", border: "none", cursor: enabled ? "default" : "pointer", fontSize: 18, padding: "6px 8px" }}
    >
      {loading ? "..." : enabled ? "🔔" : "🔕"}
    </button>
  );
}
