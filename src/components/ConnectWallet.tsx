"use client";

import { Button, Stack, Popover, Card, CardContent, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Box, Chip } from "@mui/material";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

export default function ConnectWallet() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function short(addr: string) {
    return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  }

  // Generate a simple avatar from address
  function generateAvatar(address: string) {
    const colors = ['#1565c0', '#39FF14', '#ff6b6b', '#feca57', '#a55eea'];
    const colorIndex = address.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    const initials = address.slice(2, 4).toUpperCase();
    
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: `0 0 8px ${bgColor}40`,
        }}
      >
        {initials}
      </Box>
    );
  }


  // Avoid hydration mismatch: render a stable placeholder until mounted
  if (!mounted) {
    return (
      <Button 
        variant="contained" 
        sx={{ 
          borderRadius: 999, 
          px: 2, 
          py: 0.8,
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: 'rgba(255,255,255,.1)',
          color: 'inherit',
          border: '1px solid rgba(255,255,255,.2)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,.2)',
          },
        }}
        disabled
      >
        Connect Wallet
      </Button>
    );
  }

  if (isConnected) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button 
          variant="contained" 
          sx={{ 
            borderRadius: 999, 
            px: 2, 
            py: 0.8,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: 'rgba(255,255,255,.1)',
            color: 'inherit',
            border: '1px solid rgba(255,255,255,.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,.2)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => disconnect()}
        >
          {generateAvatar(address || "")}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {short(address || "")}
          </Typography>
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Button 
        variant="contained" 
        sx={{ 
          borderRadius: 999, 
          px: 2, 
          py: 0.8,
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: 'rgba(255,255,255,.1)',
          color: 'inherit',
          border: '1px solid rgba(255,255,255,.2)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,.2)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          },
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Connect Wallet
      </Button>
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ 
          sx: { 
            mt: 1, 
            borderRadius: 3, 
            width: 320,
            bgcolor: 'rgba(255,255,255,.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.35)',
            boxShadow: '0 20px 60px rgba(2,6,23,.25)',
          } 
        }}
      >
        <Card elevation={0} sx={{ bgcolor: 'transparent' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1565c0, #39FF14)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Connect Wallet
            </Typography>
            <List dense disablePadding>
              {connectors.map((c) => (
                <ListItemButton
                  key={c.uid}
                  onClick={async () => {
                    try {
                      await connect({ connector: c });
                      setAnchorEl(null);
                    } catch {}
                  }}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    border: '1px solid rgba(148,163,184,.15)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(21,101,192,.05)',
                      border: '1px solid rgba(21,101,192,.2)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(21,101,192,.1)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "transparent" }} src={(c as { icon?: string }).icon}>
                      {(c.name || "W").slice(0, 1)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={c.name} 
                    secondary={(c as { ready?: boolean }).ready ? "Ready to connect" : "Not installed"}
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  {(c as { ready?: boolean }).ready && (
                    <Chip 
                      label="Ready" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#39FF14', 
                        color: '#000',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }} 
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
}
