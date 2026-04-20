import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colliba — Real-time video, composed.",
  description:
    "Open-source real-time video platform with biometric intelligence, hybrid recommendations, and a composed creator studio.",
  themeColor: "#f4f0e9",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-parchment text-ink selection:bg-rule selection:text-ink">
        {children}
      </body>
    </html>
  );
}
