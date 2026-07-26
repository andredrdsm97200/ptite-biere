"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteActions({
  inviteId,
  currentStatus,
}: {
  inviteId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function respond(status: "JOINED" | "DECLINED") {
    setLoading(true);
    await fetch(`/api/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  if (currentStatus === "JOINED") {
    return <div className="pill pill-cheers" style={{ fontSize: 15, padding: "10px 16px" }}>🍻 T'as dit banco !</div>;
  }
  if (currentStatus === "DECLINED") {
    return <div className="pill pill-decline" style={{ fontSize: 15, padding: "10px 16px" }}>Tu as décliné</div>;
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button className="btn btn-primary" disabled={loading} onClick={() => respond("JOINED")}>
        🍻 J'arrive !
      </button>
      <button className="btn btn-secondary" disabled={loading} onClick={() => respond("DECLINED")}>
        Pas cette fois
      </button>
    </div>
  );
}
