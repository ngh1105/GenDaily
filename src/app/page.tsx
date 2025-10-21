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
  const totalScore = (stats as { total_score?: number })?.total_score ?? 0;

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
      background: dark ? '#0F172A' : '#F4F5F7',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} />
      
      <Container sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        position: 'relative', 
        zIndex: 1,
        maxWidth: { xs: '100%', sm: '720px' },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 'calc(100vh - 100px)', md: 'calc(100vh - 120px)' },
      }}>
        <Stack spacing={4} alignItems="center" sx={{ width: '100%', maxWidth: { xs: '100%', sm: '640px' } }}>
          {/* Main Stats Card */}
          <Box sx={{
            borderRadius: 3,
            background: dark ? '#1E293B' : '#FFFFFF',
            border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
            boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
            p: { xs: 3, sm: 4 },
            width: '100%',
            position: 'relative',
            '&:hover': {
              boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
            },
            transition: 'all 0.2s ease-in-out',
          }}>
            <StatsCard 
              loading={statsLoading || !isConnected} 
              isCheckedToday={isConnected ? checkedToday : false} 
              lastDayIndex={isConnected ? lastDay : undefined} 
              streak={isConnected ? (streak as number) : 0} 
              total={isConnected ? (total as number) : 0} 
              totalScore={isConnected ? (totalScore as number) : 0} 
              nextReset={nextReset}
              dark={dark}
            />
          </Box>

          {/* Streak Visualization */}
          {isConnected && last7 && (
            <Box sx={{
              borderRadius: 3,
              background: dark ? '#1E293B' : '#FFFFFF',
              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
              boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
              p: { xs: 3, sm: 4 },
              width: '100%',
              position: 'relative',
              '&:hover': {
                boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease-in-out',
              },
              transition: 'all 0.2s ease-in-out',
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
