import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisBay - Evidence-Gated AI Safety Testing & Blinded Zero-Trust Enclave",
  description:
    "Securing Adversarial AI Safety Testing Infrastructure - Hack in Hills '26 (Track 04: Bayora). Hardware-isolated enclaves, commit-reveal protocols, and Merkle audit ledgers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "AegisBay - Evidence-Gated AI Safety Testing & Zero-Trust Enclave",
    description:
      "Eliminating benchmark gaming, evaluator collusion, and post-hoc result tampering with cryptographic commit-reveal protocols.",
    siteName: "AegisBay",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-slate-100 antialiased min-h-screen flex flex-col font-sans selection:bg-status-cyan selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
