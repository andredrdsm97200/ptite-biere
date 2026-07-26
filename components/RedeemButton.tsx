"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedeemButton({
  inviteId,
  recipientUserId,
}: {
  inviteId: string;
  recipientUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRedeem() {
    setLoading(true);
    const res = await fetch(`/api/invites/${inviteId}/redeem`, {
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

  if (done) return null;

  return (
    <button className="btn-curse" disabled={loading} onClick={handleRedeem}>
      {loading ? "..." : "✅ Tournée reçue"}
    </button>
  );
}
