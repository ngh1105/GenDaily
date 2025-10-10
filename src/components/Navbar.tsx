"use client";
import { AppBar, Toolbar, Typography, IconButton, Stack, Tooltip, Box } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const ConnectWallet = dynamic(() => import("./ConnectWallet"), { ssr: false });

type Props = { dark: boolean; toggleDark: () => void };

export default function Navbar({ }: Props) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("ui-theme") as "light" | "dark")) || "light";
    if (typeof document !== "undefined") document.documentElement.dataset.theme = saved;
    setMode(saved);
  }, []);
  
  const toggleUiMode = () => {
    const next = mode === "light" ? "dark" : "light";
    if (typeof document !== "undefined") document.documentElement.dataset.theme = next;
    if (typeof window !== "undefined") localStorage.setItem("ui-theme", next);
    setMode(next);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'rgba(255,255,255,.05)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,.1)',
      }}
    >
      <Toolbar sx={{ maxWidth: '1080px', mx: 'auto', width: '100%' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Box
            component="img"
            src="/icon.svg"
            alt="GenDaily"
            sx={{
              width: 32,
              height: 32,
              filter: 'var(--text)',
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1565c0, #39FF14)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              fontSize: '1.4rem',
            }}
          >
            GenDaily
          </Typography>
        </Box>
        
        {/* Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={mode === "light" ? "Switch to dark" : "Switch to light"}>
            <IconButton 
              color="inherit" 
              aria-label="toggle dark mode" 
              onClick={toggleUiMode}
              sx={{
                bgcolor: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.2)',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                },
              }}
            >
              {mode === "light" ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          
          <Box sx={{
            bgcolor: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 2,
            p: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            },
          }}>
            <ConnectWallet />
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

