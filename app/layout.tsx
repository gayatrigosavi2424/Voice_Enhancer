import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voice Enhancer Pro - Professional Audio Enhancement',
  description: 'Remove background noise, enhance voice quality, and create perfect recordings for content creators and singers.',
  keywords: 'voice enhancement, audio processing, noise removal, voice over, recording',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}