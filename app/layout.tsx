import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Civix GC Bid-Leveling",
  description:
    "Preconstruction toolkit for leveling subcontractor bids and managing RFQs"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-primary-700">
                Civix GC
              </Link>
              <nav className="flex items-center gap-4 text-sm text-slate-600">
                <Link href="/projects">Projects</Link>
                <Link href="/trade-scopes/demo">Trade Scopes</Link>
                <Link href="/auth/sign-in">Sign In</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Civix Preconstruction Platform
          </footer>
        </div>
      </body>
    </html>
  );
}
