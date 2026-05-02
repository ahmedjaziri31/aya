import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { LockMode } from "@/components/LockMode";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ismaani",
  description: "Communication accessible pour tous",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ismaani",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1B2A4A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full`}>
      <body className="h-full flex flex-col antialiased">
        <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          {children}
        </main>
        <BottomNav />
        <LockMode />
        <VoiceAssistant />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
