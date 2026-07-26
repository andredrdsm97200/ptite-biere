"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="nav-link" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
      Déconnexion
    </button>
  );
}
