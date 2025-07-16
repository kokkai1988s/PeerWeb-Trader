import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'PeerWeb Trader',
  description: 'A decentralized P2P trading protocol.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono">
        <audio autoPlay loop>
          <source src="https://cdn.pixabay.com/download/audio/2022/10/18/audio_841d244a53.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
