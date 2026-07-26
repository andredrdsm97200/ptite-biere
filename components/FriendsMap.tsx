"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Point = { id: string; username: string; lat: number; lng: number; self?: boolean };

function pinIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">${emoji}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 26],
    popupAnchor: [0, -26],
  });
}

export default function FriendsMap() {
  const [points, setPoints] = useState<Point[]>([]);
  const [me, setMe] = useState<Point | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/friends/locations")
      .then((r) => r.json())
      .then((data) => {
        setPoints(data.points || []);
        setMe(data.me || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card"><p className="empty" style={{ padding: 0 }}>Chargement de la carte...</p></div>;

  const all = me ? [me, ...points] : points;

  if (all.length === 0) {
    return (
      <div className="card">
        <div className="section-title" style={{ margin: 0, marginBottom: 6 }}>🗺️ Qui est chaud, et où</div>
        <p className="empty" style={{ padding: "6px 0" }}>
          Personne de dispo pour l'instant. Active "Chaud" pour apparaître ici, ou attends qu'un pote le fasse.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    all.reduce((s, p) => s + p.lat, 0) / all.length,
    all.reduce((s, p) => s + p.lng, 0) / all.length,
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="section-title" style={{ margin: 0, padding: "16px 16px 10px" }}>🗺️ Qui est chaud, et où</div>
      <div style={{ height: 260, borderRadius: 0 }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon("🍻")}>
              <Popup>{p.username} est chaud pour une bière 🍻</Popup>
            </Marker>
          ))}
          {me && (
            <Marker position={[me.lat, me.lng]} icon={pinIcon("📍")}>
              <Popup>Toi</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
