"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Annuler ce plan ? Tes invités qui n'ont pas encore décliné seront prévenus.")) return;
    setLoading(true);
    await fetch(`/api/invites/${inviteId}/cancel`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn btn-danger" disabled={loading} onClick={handleCancel}>
      {loading ? "..." : "❌ Annuler ce plan"}
    </button>
  );
}
