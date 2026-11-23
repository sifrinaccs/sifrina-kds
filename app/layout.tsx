import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sifrina KDS | Dark Kitchen CCS - Caracas',
  description:
    'Kitchen Display System para la Dark Kitchen de Sifrina CCS en Caracas. Monitoreo en tiempo real de línea de vapor, setbox y comanda.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans select-none min-h-screen">
        {children}
      </body>
    </html>
  );
}
