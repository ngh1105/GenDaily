"use client";

import { Box, Container, Stack } from "@mui/material";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import dynamic from "next/dynamic";
const CheckInButton = dynamic(() => import("../components/CheckInButton"), { ssr: false });
import StreakChart from "../components/StreakChart";
import SnackbarHost from "../components/SnackbarHost";
import { useIsCheckedToday, useLast7Counts, useMyStats, useNextResetTime } from "../hooks/useCheckinData";
import { useCheckinAction } from "../hooks/useCheckinAction";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useGenlayerSigner } from "../hooks/useGenlayerSigner";

export default function Page() {
  useGenlayerSigner();
  const [dark, setDark] = useState(false);
  const { isConnected } = useAccount();
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: checkedData } = useIsCheckedToday();
  const { data: last7, isLoading: last7Loading } = useLast7Counts();
  const { data: nextReset } = useNextResetTime();
  const action = useCheckinAction();

  const checkedToday = Boolean(checkedData);
  const lastDay = (stats as { last_day?: number })?.last_day;
  const streak = (stats as { streak?: number })?.streak ?? 0;
  const total = (stats as { total?: number })?.total ?? 0;

  // Custom cursor spotlight effect
  useEffect(() => {
    const spotlight = document.querySelector('.cursor-spotlight') as HTMLElement;
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
      spotlight.classList.add('visible');
    };

    const handleMouseLeave = () => {
      spotlight.classList.remove('visible');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: `radial-gradient(1200px 600px at 70% 10%, rgba(21,101,192,.10), transparent),
                   linear-gradient(180deg, #0e1a2b 0%, #0b1220 100%)`,
      position: 'relative',
      overflow: 'hidden',
      // cursor: 'none', // Hide default cursor for custom spotlight
    }}>
      {/* Custom cursor spotlight */}
      <Box
        sx={{
          position: 'fixed',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57,255,20,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'transform 0.1s ease-out',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          '&.visible': {
            opacity: 1,
          },
        }}
        className="cursor-spotlight"
      />
      
      {/* Subtle spotlight effect */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '600px',
        background: 'radial-gradient(ellipse, rgba(57,255,20,.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} />
      
      <Container sx={{ 
        py: { xs: 4, md: 6 }, 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '1080px !important',
        px: { xs: 2, sm: 3, md: 4 },
      }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Hero Card with Glassmorphism */}
          <Box sx={{
            borderRadius: { xs: 4, md: 6 },
            backdropFilter: 'blur(8px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,.9), rgba(246,248,251,.85))',
            border: '1px solid rgba(255,255,255,.35)',
            boxShadow: '0 20px 60px rgba(2,6,23,.25)',
            p: { xs: 3, md: 4 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 500, md: 600 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)',
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 25px 70px rgba(2,6,23,.35)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <StatsCard 
              loading={statsLoading || !isConnected} 
              isCheckedToday={isConnected ? checkedToday : false} 
              lastDayIndex={isConnected ? lastDay : undefined} 
              streak={isConnected ? (streak as number) : 0} 
              total={isConnected ? (total as number) : 0} 
              nextReset={nextReset} 
            />
          </Box>

          {/* Streak Visualization */}
          {isConnected && last7 && (
            <Box sx={{
              borderRadius: { xs: 4, md: 6 },
              backdropFilter: 'blur(8px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,.9), rgba(246,248,251,.85))',
            border: '1px solid rgba(255,255,255,.35)',
            boxShadow: '0 20px 60px rgba(2,6,23,.25)',
              p: { xs: 2, md: 3 },
              width: '100%',
              maxWidth: { xs: '100%', sm: 580, md: 640 },
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)',
              },
            }}>
              <StreakChart start={last7.start} counts={last7.arr} loading={last7Loading} currentStreak={streak} lastDayIndex={lastDay} />
            </Box>
          )}

          {/* Check In Button */}
          <CheckInButton
            disabled={!isConnected || checkedToday || action.isPending}
            onAccepted={() => (globalThis as { __snack?: (options: { open: boolean; message: string; severity: string }) => void }).__snack?.({ open: true, message: "Accepted… waiting for Finalized", severity: "info" })}
          />
        </Stack>
      </Container>
      
      <SnackbarHost />
    </Box>
  );
}
