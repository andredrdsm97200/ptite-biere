"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

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
    router.push("/");
    router.refresh();
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
