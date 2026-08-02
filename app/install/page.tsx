"use client";

import { useState } from "react";
import Link from "next/link";

export default function InstallPage() {
  const [tab, setTab] = useState<"ios" | "android">("ios");

  return (
    <div className="screen">
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">📲</span> Installer l'appli
        </div>
        <Link href="/" className="link-muted" style={{ fontSize: 13 }}>
          Fermer
        </Link>
      </div>

      <div className="scroll">
        <div className="container">
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--foam-dim)", marginTop: 0 }}>
            Pour avoir la vraie icône, les notifications, et l'ouvrir comme une appli normale.
          </p>

          <div style={{ display: "flex", background: "var(--ink-2)", borderRadius: 999, padding: 4, marginBottom: 22 }}>
            <button
              onClick={() => setTab("ios")}
              className="pill"
              style={{
                flex: 1, border: "none", cursor: "pointer", padding: "11px", fontSize: 13,
                background: tab === "ios" ? "var(--amber)" : "transparent",
                color: tab === "ios" ? "#241404" : "var(--foam-dim)",
              }}
            >
              📱 iPhone
            </button>
            <button
              onClick={() => setTab("android")}
              className="pill"
              style={{
                flex: 1, border: "none", cursor: "pointer", padding: "11px", fontSize: 13,
                background: tab === "android" ? "var(--amber)" : "transparent",
                color: tab === "android" ? "#241404" : "var(--foam-dim)",
              }}
            >
              📱 Samsung / Android
            </button>
          </div>

          {tab === "ios" ? (
            <>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>1. Ouvre le lien dans Safari</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Ça ne fonctionne que depuis Safari — pas Chrome, ni une autre appli.
                </p>
              </div>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>2. Appuie sur l'icône de partage</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Le carré avec une flèche vers le haut, en bas de l'écran.
                </p>
              </div>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>3. Choisis "Sur l'écran d'accueil"</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Dans la liste d'options qui remonte du bas.
                </p>
              </div>
              <div className="card">
                <strong>4. Appuie sur "Ajouter"</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  En haut à droite. L'icône apparaît directement sur ton écran d'accueil.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>1. Ouvre le lien dans Chrome</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Le navigateur par défaut sur la plupart des Samsung/Android.
                </p>
              </div>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>2. Appuie sur le menu (⋮)</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Trois points verticaux, en haut à droite de l'écran.
                </p>
              </div>
              <div className="card" style={{ marginBottom: 10 }}>
                <strong>3. Choisis "Ajouter à l'écran d'accueil"</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  Parfois Chrome le propose déjà tout seul, en bandeau en bas.
                </p>
              </div>
              <div className="card">
                <strong>4. Confirme avec "Ajouter" / "Installer"</strong>
                <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "4px 0 0" }}>
                  L'icône apparaît directement sur ton écran d'accueil.
                </p>
              </div>
            </>
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--foam-dim)", marginTop: 22, lineHeight: 1.5 }}>
            Une fois installée, ouvre toujours l'appli <strong style={{ color: "var(--amber)" }}>depuis son icône</strong> (pas
            depuis le navigateur) pour profiter des notifications et du plein écran.
          </p>
        </div>
      </div>
    </div>
  );
}
