"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { startRegistration } from "@simplewebauthn/browser";
import { enablePushNotifications } from "@/lib/push-client";
import { IconBeer } from "@/components/icons";

type Step = "form" | "notifications" | "faceid";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, phone, ref }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    setStep("notifications");
  }

  async function handleEnableNotifications() {
    setLoading(true);
    await enablePushNotifications();
    setLoading(false);
    setStep("faceid");
  }

  async function handleEnableFaceId() {
    setLoading(true);
    setError("");
    try {
      const optionsRes = await fetch("/api/webauthn/register-options", { method: "POST" });
      const options = await optionsRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      await fetch("/api/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attestation),
      });
    } catch {
      // annulé ou non supporté par l'appareil — on n'en fait pas un drame
    }
    setLoading(false);
    finishOnboarding();
  }

  function finishOnboarding() {
    router.push("/");
    router.refresh();
  }

  if (step === "notifications") {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo">🔔</div>
        <h1 className="auth-title">Active les notifications</h1>
        <p className="auth-sub">
          Pour recevoir un "P'tite bière ?" même quand l'appli est fermée. On ne te le
          redemandera plus après ça.
        </p>
        <button className="btn btn-primary" disabled={loading} onClick={handleEnableNotifications}>
          {loading ? "..." : "🔔 Activer"}
        </button>
        <button className="link-muted" style={{ marginTop: 14, display: "block", width: "100%" }} onClick={() => setStep("faceid")}>
          Plus tard
        </button>
      </div>
    );
  }

  if (step === "faceid") {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo">
          <IconBeer size={40} />
        </div>
        <h1 className="auth-title">Face ID / Touch ID ?</h1>
        <p className="auth-sub">
          Pour retrouver l'appli d'un coup de regard, sans retaper ton mot de passe à chaque
          réouverture.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <button className="btn btn-primary" disabled={loading} onClick={handleEnableFaceId}>
          {loading ? "..." : "🔐 Activer"}
        </button>
        <button className="link-muted" style={{ marginTop: 14, display: "block", width: "100%" }} onClick={finishOnboarding}>
          Plus tard
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">🍺</div>
      <h1 className="auth-title">Rejoins la tournée</h1>
      <p className="auth-sub">
        {ref ? `${ref} t'invite — vous serez automatiquement amis.` : "Un pseudo, un e-mail, un mot de passe. C'est tout."}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Pseudo</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex : momo69"
          />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
          />
        </div>
        <div className="field">
          <label>Téléphone (facultatif — pour que tes potes te retrouvent via leurs contacts)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
          />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
          />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="auth-sub" style={{ marginTop: 18 }}>
        Déjà inscrit ?{" "}
        <Link href="/login" className="link-muted">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="center-screen">
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
