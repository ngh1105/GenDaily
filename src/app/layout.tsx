"use client";

import { ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import {
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config, studioNet } from "../lib/walletConfig";

import { useMemo } from "react";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: "light", primary: { main: "#1565c0" } },
        shape: { borderRadius: 12 },
        typography: { fontFamily: ["Inter", "system-ui", "Arial"].join(",") },
      }),
    []
  );
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <title>GenDaily - Daily Check-in dApp</title>
        <meta name="description" content="GenDaily - A futuristic daily check-in dApp built on GenLayer blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('ui-theme')||'light';document.documentElement.dataset.theme=m;}catch(e){}})();",
          }}
        />
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={lightTheme()}
              initialChain={studioNet}
            >
              <ThemeProvider theme={theme}>
                <CssBaseline />
                {/* pass dark toggle via context provider if needed; quick prop drilling in page */}
                <div>{children}</div>
              </ThemeProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
