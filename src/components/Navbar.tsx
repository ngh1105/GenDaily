"use client";
import { AppBar, Toolbar, Typography, IconButton, Stack, Tooltip, Box } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const ConnectWallet = dynamic(() => import("./ConnectWallet"), { ssr: false });

type Props = { dark: boolean; toggleDark: () => void };

export default function Navbar({ dark, toggleDark }: Props) {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        borderBottom: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
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
              filter: dark ? 'brightness(0) invert(1)' : 'none',
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
          <Tooltip title={dark ? "Switch to light" : "Switch to dark"}>
            <IconButton 
              color="inherit" 
              aria-label="toggle dark mode" 
              onClick={toggleDark}
              sx={{
                bgcolor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                borderRadius: 2,
                p: 1,
                color: dark ? '#FFFFFF' : '#111827',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {dark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          
          <Box sx={{
            bgcolor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
            borderRadius: 2,
            p: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}>
            <ConnectWallet dark={dark} />
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

