"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Match = { id: string; username: string; relation: "NONE" | "PENDING" | "ACCEPTED" };

const relationLabel: Record<Match["relation"], string> = {
  NONE: "Ajouter",
  PENDING: "En attente",
  ACCEPTED: "Déjà ami",
};

export default function ContactsFinder({ username }: { username: string }) {
  const router = useRouter();
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // navigator.contacts (Contact Picker API) : uniquement Chrome/Edge sur Android.
    setSupported(
      typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window
    );
    setInviteUrl(`${window.location.origin}/register?ref=${encodeURIComponent(username)}`);
  }, [username]);

  async function handlePickContacts() {
    setError("");
    setMatches(null);
    setLoading(true);
    try {
      // @ts-ignore — API expérimentale, pas encore dans les types TS standards
      const contacts = await (navigator as any).contacts.select(["tel"], { multiple: true });
      const phones: string[] = contacts.flatMap((c: any) => c.tel || []);
      if (phones.length === 0) {
        setError("Aucun numéro trouvé dans les contacts sélectionnés.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/friends/find-by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones }),
      });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("Impossible de lire les contacts. Réessaie.");
      }
    }
    setLoading(false);
  }

  async function addFriend(targetUsername: string) {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: targetUsername }),
    });
    setMatches((prev) =>
      prev ? prev.map((m) => (m.username === targetUsername ? { ...m, relation: "PENDING" } : m)) : prev
    );
    router.refresh();
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "P'tite bière ?",
          text: `Rejoins-moi sur P'tite bière pour qu'on s'invite à boire un coup !`,
          url: inviteUrl,
        });
        return;
      } catch {
        // partage annulé, on ne fait rien
      }
    }
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {supported && (
        <div className="card">
          <strong>Trouver des amis dans tes contacts</strong>
          <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
            On regarde juste quels numéros que tu choisis sont déjà sur l'appli — rien n'est
            enregistré ni envoyé sans ton accord à chaque fois.
          </p>
          {error && <div className="error-banner">{error}</div>}
          <button className="btn btn-secondary" onClick={handlePickContacts} disabled={loading}>
            {loading ? "Recherche..." : "📱 Choisir des contacts"}
          </button>

          {matches && matches.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--foam-dim)", marginTop: 10 }}>
              Aucun de ces contacts n'est encore sur l'appli — envoie-leur plutôt ton lien
              d'invitation ci-dessous.
            </p>
          )}
          {matches && matches.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {matches.map((m) => (
                <div key={m.id} className="row" style={{ padding: "8px 0" }}>
                  <span>{m.username}</span>
                  {m.relation === "NONE" ? (
                    <button className="btn btn-primary btn-sm" onClick={() => addFriend(m.username)}>
                      Ajouter
                    </button>
                  ) : (
                    <span className="pill">{relationLabel[m.relation]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <strong>{supported ? "Ou envoie ton lien" : "Trouver des amis"}</strong>
        <p style={{ fontSize: 13, color: "var(--foam-dim)", margin: "6px 0 12px" }}>
          {supported
            ? "Pratique pour les potes qui n'ont pas encore l'appli."
            : "L'accès direct aux contacts n'est pas disponible sur cet appareil (limite d'Apple sur iPhone) — envoie plutôt ce lien par SMS ou WhatsApp, et vous serez automatiquement amis dès qu'iel s'inscrit."}
        </p>
        <button className="btn btn-primary" onClick={handleShare}>
          {copied ? "Lien copié ✓" : "🔗 Partager mon lien d'invitation"}
        </button>
      </div>
    </div>
  );
}
