import '@/styles/globals.css';

import { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'foti-box.com',
  description: 'Gallerie',
  icons: '/favicon.ico',
};

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'block',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'block',
});

interface LayoutProperties {
  children: ReactNode;
}

const RootLayout: React.FC<LayoutProperties> = async ({ children }) => {
  return (
    <html className={`${montserrat.className} ${inter.className}`} lang="en">
      <body className="flex h-dvh w-dvw flex-col overflow-x-hidden bg-[#f8fafc]">
        <div className="mt-[62px] h-[calc(100dvh-62px)] xl:ml-[480px]">
          <main className="flex min-h-full flex-col justify-between">{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
