"use client";
import { Box, Skeleton, Stack, Typography, LinearProgress } from "@mui/material";
import CheckRounded from "@mui/icons-material/CheckRounded";

type Props = { start: number; counts: number[]; loading?: boolean; currentStreak?: number; lastDayIndex?: number };

export default function StreakChart({ start, counts, loading, currentStreak: propStreak, lastDayIndex }: Props) {
  if (loading) return <Skeleton variant="rounded" width={640} height={120} />;
  
  const NEON = "#39FF14";
  // Derive checked state from user's streak if provided to avoid using global day counts
  const streak = Math.max(0, Number(propStreak ?? 0));
  const lastIndex = Number.isFinite(lastDayIndex) ? (lastDayIndex as number) : (start + counts.length - 1);

  const items = counts.map((v, i) => {
    const dayIdx = start + i;
    // Mark as checked only if this day is within [lastIndex - streak + 1, lastIndex]
    const isCheckedByStreak = streak > 0 && dayIdx <= lastIndex && dayIdx >= (lastIndex - streak + 1);
    return {
      dayIndex: dayIdx,
      label: new Date(dayIdx * 86400 * 1000).toISOString().slice(5, 10),
      checked: isCheckedByStreak,
      isToday: i === counts.length - 1, // Last item is today
    };
  });

  // Use streak from backend or calculate from 7-day data
  const currentStreak = streak;
  const checkedCount = items.filter(item => item.checked).length;
  
  // Calculate streak from 7-day data for validation (optional)
  let calculatedStreak = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].checked) {
      calculatedStreak++;
    } else {
      break;
    }
  }
  
  // Debug log to check data consistency
  console.log('StreakChart Debug:', {
    propStreak,
    lastDayIndex,
    currentStreak,
    calculatedStreak,
    checkedCount,
    items: items.map(item => ({ label: item.label, checked: item.checked })),
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header with weekly progress */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/icon.svg"
            alt="GenDaily"
            sx={{
              width: 20,
              height: 20,
              filter: 'var(--text)',
            }}
          />
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1565c0, #39FF14)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Current Streak
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'} in a row
        </Typography>
      </Stack>

      {/* Weekly Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(currentStreak / 7, 1) * 100} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            bgcolor: 'rgba(148,163,184,.15)',
            '& .MuiLinearProgress-bar': {
              bgcolor: currentStreak >= 7 ? '#39FF14' : '#1565c0',
              borderRadius: 3,
            }
          }} 
        />
        {currentStreak === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Start your streak by checking in today!
          </Typography>
        )}
      </Box>

      {/* Neon Circles */}
      <Stack 
        direction="row" 
        gap={2} 
        alignItems="center" 
        justifyContent="center" 
        sx={{ 
          overflowX: { xs: 'auto', md: 'visible' }, 
          scrollSnapType: 'x mandatory',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(148,163,184,.1)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(148,163,184,.3)',
            borderRadius: 2,
          },
        }}
      >
        {items.map((item, i) => (
          <Stack key={item.dayIndex} spacing={1} alignItems="center" sx={{ 
            scrollSnapAlign: 'center',
            minWidth: 'fit-content',
          }}>
            <Box
              sx={{
                width: 58, 
                height: 58, 
                borderRadius: '50%',
                display: 'grid', 
                placeItems: 'center',
                bgcolor: item.checked ? '#39FF14' : 'rgba(148,163,184,.15)',
                color: item.checked ? '#000' : 'text.secondary',
                border: item.checked ? '2px solid #00c853' : '1px solid rgba(148,163,184,.25)',
                boxShadow: item.checked
                  ? `0 0 12px #39FF14, inset 0 0 10px #39FF14`
                  : 'inset 0 0 10px rgba(0,0,0,.06)',
                transition: 'transform .2s ease, box-shadow .2s ease',
                ...(item.isToday && { 
                  outline: `2px solid rgba(57,255,20,.35)`,
                  outlineOffset: '2px',
                }),
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: item.checked 
                    ? `0 0 16px #39FF14, inset 0 0 12px #39FF14`
                    : '0 4px 12px rgba(0,0,0,.15)',
                },
                animation: `fadeInScale .4s ease ${i * 80}ms both`,
                '@keyframes fadeInScale': { 
                  from: { opacity: 0, transform: 'scale(.8)' }, 
                  to: { opacity: 1, transform: 'scale(1)' } 
                },
              }}
              aria-label={`${item.label}: ${item.checked ? "checked" : "no check"}`}
            >
              {item.checked && <CheckRounded sx={{ fontSize: 28 }} />}
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                textAlign: 'center',
                minWidth: '40px',
              }}
            >
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Achievement Badges */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        {[
          { label: '7d', achieved: currentStreak >= 7, color: '#39FF14' },
          { label: '30d', achieved: currentStreak >= 30, color: '#39FF14' },
          { label: '100d', achieved: currentStreak >= 100, color: '#39FF14' },
        ].map((badge) => (
          <Box
            key={badge.label}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: badge.achieved ? badge.color : 'rgba(148,163,184,.15)',
              color: badge.achieved ? '#000' : 'text.secondary',
              border: badge.achieved ? `2px solid ${badge.color}` : '1px solid rgba(148,163,184,.25)',
              boxShadow: badge.achieved ? `0 0 8px ${badge.color}` : 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              opacity: badge.achieved ? 1 : 0.6,
              transition: 'all .2s ease',
              '&:hover': { 
                transform: 'scale(1.1)',
                opacity: 1,
              },
            }}
          >
            {badge.label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

