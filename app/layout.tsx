// app/layout.tsx
"use client"; // required for Redux + ThemeProvider

import { ReactNode, Suspense } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import ReduxProvider from "@/redux/provider";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/common/CookieBanner";
import CsrfPrefetch from "@/components/CsrfPrefetch";

// Load Inter font via Next.js 16 font optimization
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Lazy load error boundary
const ErrorBoundary = dynamic(() => import("@/components/common/ErrorBoundary"), {
  ssr: false,
});

// Suspense fallback component
const Loading = () => <div>Loading...</div>;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <Head>
        <title>Ornavibe — Gift Baskets by Rason Business</title>
        <meta
          name="description"
          content="Ornavibe — Curated gift baskets for every occasion. By Rason Business. Order online, gift messages, secure checkout, delivery."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <body className="font-inter">
        <ReduxProvider>
          <CsrfPrefetch />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<Loading />}>
              <ErrorBoundary>
                {children}
                <CookieBanner />
              </ErrorBoundary>
            </Suspense>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
