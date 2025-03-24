import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar'
import GoogleAnalytics from '@/components/GoogleAnalytics';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CurioCity | Your Trivia Adventure",
  description: "Generate and answer trivia questions across various categories and difficulty levels",
  keywords: "trivia, quiz, questions, knowledge, learning, fun, game",
  authors: [{ name: "CurioCity Team" }],
  robots: "index, follow",
};

// Add a separate viewport export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Define the types for the props
type Params = Promise<{ segment?: string }>

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Params;
}) {
  // Await the params Promise
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = await props.params;
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics />
        <Navbar />
        {props.children}
      </body>
    </html>
  );
}
