import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather",
  description: "Weather PAge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Lien vers votre favicon */}
        <link rel="icon" href="/favicon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  );
}
