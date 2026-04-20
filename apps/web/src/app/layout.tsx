import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n";
import { AppHeader, AppFooter } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "FX Whale Radar",
  description: "Institutional flow monitor for FX markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <AppHeader />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
          <AppFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
