import type { Metadata } from 'next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import './globals.css';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  variable: '--font-fira-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'EcoTrack — Track & Reduce Your Carbon Footprint',
  description:
    'Understand, track, and reduce your personal carbon footprint with AI-powered insights and gamified challenges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${firaCode.variable} ${firaSans.variable} dark`}
    >
      <body className="bg-background text-foreground font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
