import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FX Whale Radar",
  description: "Institutional flow monitor for FX markets",
};

const nav = [
  { href: "/", label: "Overview" },
  { href: "/alerts", label: "Live Radar" },
  { href: "/macro", label: "Macro" },
  { href: "/news", label: "News" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/replay", label: "Replay" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-border bg-panel/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 h-14">
            <Link href="/" className="font-semibold tracking-tight">
              FX <span className="text-accent">Whale Radar</span>
            </Link>
            <nav className="flex gap-4 text-sm text-slate-300">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-white">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto text-xs text-muted">
              Not investment advice · data: demo
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-7xl mx-auto px-4 py-8 text-xs text-muted">
          FX Whale Radar · analytical / monitoring tool only · no trade execution
        </footer>
      </body>
    </html>
  );
}
