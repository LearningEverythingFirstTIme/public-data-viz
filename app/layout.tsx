import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataLens - Data Visualization Dashboard",
  description: "Create beautiful, customizable data visualization dashboards with DataLens. Connect to multiple data sources and build stunning charts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If no publishable key, render without ClerkProvider (for static builds)
  if (!publishableKey || publishableKey.includes('dummy')) {
    return (
      <html lang="en" className="dark">
        <body
          className={`${syne.variable} ${ibmPlexMono.variable} font-sans antialiased bg-[#0A0C10] text-white`}
        >
          {children}
        </body>
      </html>
    );
  }
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="dark">
        <body
          className={`${syne.variable} ${ibmPlexMono.variable} font-sans antialiased bg-[#0A0C10] text-white`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
