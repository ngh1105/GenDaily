"use client";
import { Box, Typography, Chip, Stack, Skeleton, LinearProgress } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import { useEffect, useState } from "react";

type Props = {
  loading?: boolean;
  isCheckedToday?: boolean;
  lastDayIndex?: number;
  streak?: number;
  total?: number;
  nextReset?: number; // epoch seconds
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(h)}:${z(m)}:${z(s)}`;
}

export default function StatsCard({ loading, isCheckedToday, streak, total, nextReset }: Props) {
  const [mounted, setMounted] = useState(false);
  const [remainMs, setRemainMs] = useState(0);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !nextReset) return;
    const update = () => setRemainMs(nextReset * 1000 - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [mounted, nextReset]);

  // Calculate progress for 7/30 day goals
  const progress7 = Math.min((streak ?? 0) / 7, 1);
  const progress30 = Math.min((streak ?? 0) / 30, 1);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/icon.svg"
            alt="GenDaily"
            sx={{
              width: 24,
              height: 24,
              filter: 'var(--text)',
            }}
          />
          <Typography variant="h5" sx={{ 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #1565c0, #39FF14)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            Daily Check-in
          </Typography>
        </Box>
        {isCheckedToday && (
          <Chip 
            icon={<CheckCircleRounded sx={{ fontSize: 20 }} />} 
            label="Checked today" 
            sx={{ 
              fontWeight: 700, 
              bgcolor: '#1a7f37', 
              color: '#fff',
              '& .MuiChip-icon': { color: '#fff' },
              boxShadow: '0 4px 12px rgba(26,127,55,.3)',
            }} 
          />
        )}
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" width="100%" height={32} />
          <Skeleton variant="rounded" width="80%" height={24} />
          <Skeleton variant="rounded" width="60%" height={24} />
          <Skeleton variant="rounded" width="40%" height={20} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          {/* Stats Grid */}
          <Stack direction="row" spacing={3} justifyContent="space-between">
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1565c0', mb: 0.5 }}>
                {streak ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Current Streak
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#39FF14', mb: 0.5 }}>
                {total ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Days
              </Typography>
            </Box>
          </Stack>

          {/* Progress Rings */}
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>7-Day Goal</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.min(streak ?? 0, 7)}/7
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progress7 * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(148,163,184,.15)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress7 === 1 ? '#39FF14' : '#1565c0',
                    borderRadius: 4,
                  }
                }} 
              />
            </Box>
            
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>30-Day Goal</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.min(streak ?? 0, 30)}/30
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progress30 * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(148,163,184,.15)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress30 === 1 ? '#39FF14' : '#1565c0',
                    borderRadius: 4,
                  }
                }} 
              />
            </Box>
          </Stack>

          {/* Countdown */}
          {mounted && nextReset && (
            <Box sx={{
              display: 'inline-flex', 
              alignItems: 'center',
              px: 2, 
              py: 1, 
              borderRadius: 2,
              bgcolor: 'rgba(148,163,184,.15)', 
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              Next reset (UTC) in {formatCountdown(remainMs)}
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

