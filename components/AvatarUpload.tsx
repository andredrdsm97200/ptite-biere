"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SIZE = 200;

function resizeToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        // recadrage centré en carré
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AvatarUpload({ currentAvatarUrl }: { currentAvatarUrl?: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const dataUrl = await resizeToSquare(file);
      setPreview(dataUrl);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Échec de l'envoi.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Impossible de lire cette image.");
    }
    setLoading(false);
  }

  async function handleRemove() {
    setLoading(true);
    await fetch("/api/profile/avatar", { method: "DELETE" });
    setPreview(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          margin: "0 auto 12px",
          background: preview ? `url(${preview}) center/cover` : "var(--ink-3)",
          border: "2px solid var(--amber)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--foam-dim)",
        }}
      >
        {!preview && "Ajouter"}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {error && <div className="error-banner">{error}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn btn-secondary" style={{ width: "auto" }} disabled={loading} onClick={() => inputRef.current?.click()}>
          {loading ? "..." : preview ? "Changer la photo" : "Choisir une photo"}
        </button>
        {preview && (
          <button className="btn btn-danger" style={{ width: "auto" }} disabled={loading} onClick={handleRemove}>
            Retirer
          </button>
        )}
      </div>
    </div>
  );
}
