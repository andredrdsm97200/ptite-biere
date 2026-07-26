"use client";

import dynamic from "next/dynamic";

const FriendsMap = dynamic(() => import("./FriendsMap"), {
  ssr: false,
  loading: () => (
    <div className="card">
      <p className="empty" style={{ padding: 0 }}>Chargement de la carte...</p>
    </div>
  ),
});

export default function FriendsMapWrapper() {
  return <FriendsMap />;
}
