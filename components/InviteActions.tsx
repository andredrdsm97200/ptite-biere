"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JoinCelebration from "./JoinCelebration";

export default function InviteActions({
  inviteId,
  currentStatus,
}: {
  inviteId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"HOST" | "PUBLIC">("HOST");

  async function respond(next: "JOINED" | "DECLINED") {
    setLoading(true);
    await fetch(`/api/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    setStatus(next);
    if (next === "JOINED") {
      setCelebrating(true);
    } else {
      router.refresh();
    }
  }

  async function confirmCancel() {
    setLoading(true);
    await fetch(`/api/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED", note, noteVisibility: visibility }),
    });
    setLoading(false);
    setCancelling(false);
    setStatus("CANCELLED");
    router.refresh();
  }

  if (status === "DECLINED") {
    return <div className="pill pill-decline" style={{ fontSize: 15, padding: "10px 16px" }}>Tu as décliné</div>;
  }

  if (status === "CANCELLED") {
    return <div className="pill pill-decline" style={{ fontSize: 15, padding: "10px 16px" }}>😬 Tu as annulé ta venue</div>;
  }

  if (status === "JOINED") {
    if (cancelling) {
      return (
        <div>
          <p style={{ fontSize: 13, color: "var(--foam-dim)", marginBottom: 8 }}>
            Un petit mot pour te justifier (facultatif) ?
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Désolé les gars, urgence chat..."
            style={{
              width: "100%", background: "var(--ink)", border: "1px solid rgba(242,238,230,0.12)",
              borderRadius: 12, padding: "10px 12px", color: "var(--foam)", fontSize: 14, minHeight: 70, marginBottom: 10,
            }}
          />
          <div className="toggle-row" style={{ padding: "4px 0 10px" }}>
            <span style={{ fontSize: 13 }}>Visible par tous les invités</span>
            <div
              className={`switch ${visibility === "PUBLIC" ? "on" : ""}`}
              onClick={() => setVisibility(visibility === "PUBLIC" ? "HOST" : "PUBLIC")}
            >
              <div className="knob" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-danger" disabled={loading} onClick={confirmCancel}>
              {loading ? "..." : "Confirmer l'annulation"}
            </button>
            <button className="btn btn-secondary" onClick={() => setCancelling(false)}>
              Retour
            </button>
          </div>
        </div>
      );
    }
    return (
      <div>
        {celebrating && (
          <JoinCelebration
            onDone={() => {
              setCelebrating(false);
              router.refresh();
            }}
          />
        )}
        <div className="pill pill-cheers" style={{ fontSize: 15, padding: "10px 16px", marginBottom: 10 }}>
          🍻 T'as dit banco !
        </div>
        <button className="link-muted" onClick={() => setCancelling(true)}>
          Annuler ma présence
        </button>
      </div>
    );
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
