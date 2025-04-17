import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header"; // Import Header
import Box from '@mui/material/Box';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "News AI",
  description: "AI Curated News",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeRegistry>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header /> {/* Add Header here */}
              <Box component="main" sx={{ flexGrow: 1 }}> {/* Main content area */}
                 {children}
              </Box>
              {/* Optional: Add a Footer component here */}
            </Box>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
