"use client";
import { Box, Skeleton, Stack, Typography, LinearProgress } from "@mui/material";
import CheckRounded from "@mui/icons-material/CheckRounded";

type Props = { start: number; counts: number[]; loading?: boolean; currentStreak?: number; lastDayIndex?: number };

export default function StreakChart({ start, counts, loading, currentStreak: propStreak, lastDayIndex }: Props) {
  if (loading) return <Skeleton variant="rounded" width={640} height={120} />;
  
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
            color: '#111827',
            fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
            fontSize: '18px',
          }}>
            Current Streak
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          color: '#6B7280',
          fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
          fontSize: '14px',
        }}>
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
            borderRadius: 2,
            bgcolor: '#F3F4F6',
            '& .MuiLinearProgress-bar': {
              background: currentStreak >= 7 
                ? 'linear-gradient(90deg, #22C55E, #10B981)' 
                : 'linear-gradient(90deg, #22C55E, #10B981)',
              borderRadius: 2,
            }
          }} 
        />
        {currentStreak === 0 && (
          <Typography variant="caption" sx={{ 
            mt: 1, 
            display: 'block', 
            textAlign: 'center',
            color: '#6B7280',
            fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
            fontSize: '12px',
          }}>
            Start your streak by checking in today!
          </Typography>
        )}
      </Box>

      {/* Clean Squares */}
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
            bgcolor: '#F3F4F6',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#D1D5DB',
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
                width: 48, 
                height: 48, 
                borderRadius: 2,
                display: 'grid', 
                placeItems: 'center',
                bgcolor: item.checked ? '#16A34A' : '#F9FAFB',
                color: item.checked ? '#FFFFFF' : '#9CA3AF',
                border: item.checked ? 'none' : '1px solid #D1D5DB',
                transition: 'all 0.2s ease-in-out',
                ...(item.isToday && { 
                  outline: `2px solid #16A34A`,
                  outlineOffset: '2px',
                }),
                '&:hover': { 
                  transform: 'translateY(-1px)',
                  bgcolor: item.checked 
                    ? '#16A34A'
                    : '#E0F2FE',
                  borderColor: item.checked 
                    ? 'none'
                    : '#3B82F6',
                  boxShadow: item.checked 
                    ? '0 4px 12px rgba(22,163,74,0.3)'
                    : '0 2px 8px rgba(59,130,246,0.2)',
                },
                animation: `fadeInScale .3s ease ${i * 50}ms both`,
                '@keyframes fadeInScale': { 
                  from: { opacity: 0, transform: 'scale(0.9)' }, 
                  to: { opacity: 1, transform: 'scale(1)' } 
                },
              }}
              aria-label={`${item.label}: ${item.checked ? "checked" : "no check"}`}
            >
              {item.checked && <CheckRounded sx={{ fontSize: 24 }} />}
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500,
                fontSize: '0.75rem',
                textAlign: 'center',
                minWidth: '40px',
                color: '#6B7280',
                fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
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
          { label: '7d', achieved: currentStreak >= 7, color: '#16A34A' },
          { label: '30d', achieved: currentStreak >= 30, color: '#16A34A' },
          { label: '100d', achieved: currentStreak >= 100, color: '#16A34A' },
        ].map((badge) => (
          <Box
            key={badge.label}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: badge.achieved ? badge.color : '#F9FAFB',
              color: badge.achieved ? '#FFFFFF' : '#9CA3AF',
              border: badge.achieved ? 'none' : '1px solid #D1D5DB',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              opacity: badge.achieved ? 1 : 0.6,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                transform: 'scale(1.05)',
                opacity: 1,
                boxShadow: badge.achieved 
                  ? '0 4px 12px rgba(22,163,74,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
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

