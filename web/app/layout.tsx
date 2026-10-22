import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisBay - Evidence-Gated AI Safety Testing & Zero-Trust Enclave",
  description:
    "Securing Adversarial AI Safety Testing Infrastructure - Hack in Hills '26 (Track 04: Bayora)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-slate-100 antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
