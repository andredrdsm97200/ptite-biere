"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="center-screen">
      <div className="auth-card">
        <div className="auth-logo">🍺</div>
        <h1 className="auth-title">P'tite bière ?</h1>
        <p className="auth-sub">Reconnecte-toi pour lancer un appel au comptoir.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label>Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-sub" style={{ marginTop: 18 }}>
          Pas encore de compte ?{" "}
          <Link href="/register" className="link-muted">
            Inscris-toi
          </Link>
        </p>
      </div>
    </div>
  );
}
