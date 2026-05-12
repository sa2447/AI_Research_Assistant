import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextThemesProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { validateEnvironment } from "@/lib/utils/validateEnv";

// Validate environment on server startup
validateEnvironment()

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Research Assistant",
  description: "Ask questions about your documents with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-screen flex bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <NextThemesProvider>
          <TooltipProvider>
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {children}
            </main>
          </TooltipProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
