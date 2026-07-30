import "./globals.css";
import type { Metadata } from "next";
import PushManager from "@/components/PushManager";
import BiometricGate from "@/components/BiometricGate";

export const metadata: Metadata = {
  title: "P'tite bière ?",
  description: "Invite tes potes à boire un coup, là maintenant.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#17181C",
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
          href="https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;600;700;800&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BiometricGate>{children}</BiometricGate>
        <PushManager />
      </body>
    </html>
  );
}
