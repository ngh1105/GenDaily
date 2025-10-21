"use client";
import { Box, Typography, Chip, Stack, Skeleton, LinearProgress } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import { useEffect, useState, useId } from "react";

type Props = {
  loading?: boolean;
  isCheckedToday?: boolean;
  lastDayIndex?: number;
  streak?: number;
  total?: number;
  totalScore?: number;
  nextReset?: number; // epoch seconds
  dark?: boolean;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(h)}:${z(m)}:${z(s)}`;
}

export default function StatsCard({ loading, isCheckedToday, streak, total, totalScore, nextReset, dark = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [remainMs, setRemainMs] = useState(0);
  const id = useId();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !nextReset) return;
    const update = () => setRemainMs(Math.max(0, nextReset * 1000 - Date.now()));
    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [mounted, nextReset]);

  // Calculate progress for 7/30 day goals
  const progress7 = Math.min((streak ?? 0) / 7, 1);
  const progress30 = Math.min((streak ?? 0) / 30, 1);

  // Avoid hydration mismatch: render consistent content until mounted
  if (!mounted) {
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
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: dark ? '#F9FAFB' : '#111827',
              letterSpacing: '0.2px',
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              fontSize: { xs: '20px', sm: '24px' },
            }}>
              Daily Check-in
            </Typography>
          </Box>
          {isCheckedToday && (
            <Chip 
              icon={<CheckCircleRounded sx={{ fontSize: 16 }} />} 
              label="Today Checked" 
              sx={{ 
                fontWeight: 600, 
                bgcolor: '#F0FDF4', 
                color: '#22C55E',
                border: '1px solid #22C55E',
                '& .MuiChip-icon': { color: '#22C55E' },
                fontSize: '0.875rem',
                height: '32px',
                borderRadius: '16px',
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
          <Stack key={`main-stack-${id}`} spacing={3}>
            {/* Stats Grid */}
            <Stack key={`stats-grid-${id}`} direction="row" spacing={2} justifyContent="space-between">
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  color: '#16A34A', 
                  mb: 0.5,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                }}>
                  {streak ?? 0}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  color: dark ? '#9CA3AF' : '#6B7280',
                  fontSize: '16px',
                }}>
                  Current Streak
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  color: '#3B82F6', 
                  mb: 0.5,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                }}>
                  {total ?? 0}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  color: dark ? '#9CA3AF' : '#6B7280',
                  fontSize: '16px',
                }}>
                  Total Days
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  color: '#F97316', 
                  mb: 0.5,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                }}>
                  {totalScore ?? 0}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500,
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  color: dark ? '#9CA3AF' : '#6B7280',
                  fontSize: '16px',
                }}>
                  Total Score
                </Typography>
              </Box>
            </Stack>

            {/* Progress Rings */}
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                   <Typography variant="body2" sx={{ 
                     fontWeight: 600,
                     fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                     color: dark ? '#E5E7EB' : '#6B7280',
                     fontSize: '14px',
                   }}>7-Day Goal</Typography>
                  <Typography variant="body2" sx={{
                    fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                    fontWeight: 500,
                    color: '#6B7280',
                    fontSize: '14px',
                  }}>
                    {Math.min(streak ?? 0, 7)}/7
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progress7 * 100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 2,
                    bgcolor: '#F3F4F6',
                    '& .MuiLinearProgress-bar': {
                      background: progress7 === 1 
                        ? 'linear-gradient(90deg, #22C55E, #10B981)' 
                        : 'linear-gradient(90deg, #22C55E, #10B981)',
                      borderRadius: 2,
                    }
                  }} 
                />
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                   <Typography variant="body2" sx={{ 
                     fontWeight: 600,
                     fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                     color: dark ? '#E5E7EB' : '#6B7280',
                     fontSize: '14px',
                   }}>30-Day Goal</Typography>
                  <Typography variant="body2" sx={{
                    fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                    fontWeight: 500,
                    color: '#6B7280',
                    fontSize: '14px',
                  }}>
                    {Math.min(streak ?? 0, 30)}/30
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progress30 * 100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 2,
                    bgcolor: '#F3F4F6',
                    '& .MuiLinearProgress-bar': {
                      background: progress30 === 1 
                        ? 'linear-gradient(90deg, #22C55E, #10B981)' 
                        : 'linear-gradient(90deg, #22C55E, #10B981)',
                      borderRadius: 2,
                    }
                  }} 
                />
              </Box>
            </Stack>

            {/* Countdown - Hidden until mounted */}
            {nextReset && (
              <Box sx={{
                display: 'inline-flex', 
                alignItems: 'center',
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                bgcolor: '#F9FAFB', 
                color: '#6B7280',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                border: '1px solid #E5E7EB',
              }}>
                Next reset (UTC) in --:--:--
              </Box>
            )}
          </Stack>
        )}
      </Box>
    );
  }

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
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: dark ? '#F9FAFB' : '#111827',
            letterSpacing: '0.2px',
            fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
            fontSize: { xs: '20px', sm: '24px' },
          }}>
            Daily Check-in
          </Typography>
        </Box>
        {isCheckedToday && (
          <Chip 
            icon={<CheckCircleRounded sx={{ fontSize: 16 }} />} 
            label="Today Checked" 
            sx={{ 
              fontWeight: 600, 
              bgcolor: '#F0FDF4', 
              color: '#22C55E',
              border: '1px solid #22C55E',
              '& .MuiChip-icon': { color: '#22C55E' },
              fontSize: '0.875rem',
              height: '32px',
              borderRadius: '16px',
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
            <Stack key={`stats-grid-mounted-${id}`} direction="row" spacing={2} justifyContent="space-between">
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                color: '#16A34A', 
                mb: 0.5,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              }}>
                {streak ?? 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                color: dark ? '#9CA3AF' : '#6B7280',
                fontSize: '16px',
              }}>
                Current Streak
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                color: '#3B82F6', 
                mb: 0.5,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              }}>
                {total ?? 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                color: dark ? '#9CA3AF' : '#6B7280',
                fontSize: '16px',
              }}>
                Total Days
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                color: '#F97316', 
                mb: 0.5,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              }}>
                {totalScore ?? 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                color: dark ? '#9CA3AF' : '#6B7280',
                fontSize: '16px',
              }}>
                Total Score
              </Typography>
            </Box>
          </Stack>

          {/* Progress Rings */}
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                 <Typography variant="body2" sx={{ 
                   fontWeight: 600,
                   fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                   color: dark ? '#E5E7EB' : '#6B7280',
                   fontSize: '14px',
                 }}>7-Day Goal</Typography>
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  fontWeight: 500,
                  color: '#6B7280',
                  fontSize: '14px',
                }}>
                  {Math.min(streak ?? 0, 7)}/7
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progress7 * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 2,
                  bgcolor: '#F3F4F6',
                  '& .MuiLinearProgress-bar': {
                    background: progress7 === 1 
                      ? 'linear-gradient(90deg, #22C55E, #10B981)' 
                      : 'linear-gradient(90deg, #22C55E, #10B981)',
                    borderRadius: 2,
                  }
                }} 
              />
            </Box>
            
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                 <Typography variant="body2" sx={{ 
                   fontWeight: 600,
                   fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                   color: dark ? '#E5E7EB' : '#6B7280',
                   fontSize: '14px',
                 }}>30-Day Goal</Typography>
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  fontWeight: 500,
                  color: '#6B7280',
                  fontSize: '14px',
                }}>
                  {Math.min(streak ?? 0, 30)}/30
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progress30 * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 2,
                  bgcolor: '#F3F4F6',
                  '& .MuiLinearProgress-bar': {
                    background: progress30 === 1 
                      ? 'linear-gradient(90deg, #22C55E, #10B981)' 
                      : 'linear-gradient(90deg, #22C55E, #10B981)',
                    borderRadius: 2,
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
              px: 3, 
              py: 1.5, 
              borderRadius: 2,
              bgcolor: '#F9FAFB', 
              color: '#6B7280',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              border: '1px solid #E5E7EB',
            }}>
              Next reset (UTC) in {formatCountdown(remainMs)}
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

