import "./globals.css";
import type { Metadata } from "next";
import PushManager from "@/components/PushManager";

export const metadata: Metadata = {
  title: "P'tite bière ?",
  description: "Invite tes potes à boire un coup, là maintenant.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#FFF6E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <PushManager />
      </body>
    </html>
  );
}
