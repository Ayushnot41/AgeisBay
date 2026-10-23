import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-code", display: "swap", preload: false });

// Apply the saved appearance before paint so dark mode never flashes light.
const themeScript = `(function(){var p='system';try{p=localStorage.getItem('aegisbay-theme')||p}catch(e){}var t=p==='dark'||p==='light'?p:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t})()`;

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#101923" },
  ],
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
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
