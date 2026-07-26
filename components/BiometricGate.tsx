"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { IconBeer } from "./icons";

export default function BiometricGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "open" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    // sessionStorage se réinitialise à chaque nouvelle ouverture de l'appli
    // (fermée puis rouverte) mais pas entre deux pages d'une même session —
    // c'est exactement le signal qu'il faut pour redemander Face ID.
    if (sessionStorage.getItem("ptite-biere-unlocked") === "true") {
      setState("open");
      return;
    }
    fetch("/api/webauthn/has-credential")
      .then((r) => r.json())
      .then((data) => setState(data.has ? "locked" : "open"))
      .catch(() => setState("open"));
  }, []);

  async function unlock() {
    setError("");
    try {
      const optionsRes = await fetch("/api/webauthn/unlock-options", { method: "POST" });
      if (!optionsRes.ok) throw new Error();
      const options = await optionsRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/webauthn/unlock-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });
      if (!verifyRes.ok) throw new Error();
      sessionStorage.setItem("ptite-biere-unlocked", "true");
      setState("open");
    } catch {
      setError("Non reconnu — réessaie.");
    }
  }

  if (state === "checking") return null;

  if (state === "locked" || state === "error") {
    return (
      <div className="center-screen">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-logo">
            <IconBeer size={48} />
          </div>
          <h1 className="auth-title">C'est bien toi ?</h1>
          <p className="auth-sub">Débloque avec Face ID / Touch ID pour retrouver tes tournées.</p>
          {error && <div className="error-banner">{error}</div>}
          <button className="btn btn-primary" onClick={unlock}>
            🔓 Débloquer
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
