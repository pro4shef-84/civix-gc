import './globals.css';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Providers } from '../components/Providers';

export const metadata = {
  title: 'BidPilot',
  description: 'AI bid leveling',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
                <div className="text-xl font-semibold">BidPilot</div>
              </header>
              <main className="flex-1 px-6 py-4">{children}</main>
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
