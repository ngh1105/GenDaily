"use client";
import { useEffect, useState, useRef } from "react";
import { Button, Snackbar, Alert, Box, TextField, Tooltip } from "@mui/material";
import { checkInWithContent, getClient, TransactionStatus, getMyStats } from "../lib/genlayer";

interface StatsResponse {
  last_day?: number;
  streak?: number;
  total?: number;
  total_score?: number;
}

type Props = {
  disabled?: boolean;
  onAccepted?: () => void;
};

export default function CheckInButton({ disabled, onAccepted }: Props) {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dailyContent, setDailyContent] = useState("");
  const [previousTotalScore, setPreviousTotalScore] = useState<number | null>(null);
  
  // Lifecycle guards and cleanup
  const mountedRef = useRef<boolean>(true);
  const timeoutsRef = useRef<Set<number>>(new Set());
  
  // Content validation constants
  const MAX_CONTENT = 280;
  const content = dailyContent.trim();
  const isContentValid = content.length > 0 && content.length <= MAX_CONTENT;
  
  useEffect(() => {
    setMounted(true);
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      // Clear all timers
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
    };
  }, []);

  async function handleCheckIn() {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      // Get current total score before check-in
      try {
        const currentStats = await getMyStats() as StatsResponse | null;
        const currentTotalScore = currentStats?.total_score ?? 0;
        setPreviousTotalScore(Number(currentTotalScore));
      } catch (error) {
        console.warn("Could not fetch current stats:", error);
        setPreviousTotalScore(null);
      }

      const hash = await checkInWithContent(content);
      if (!mountedRef.current) return;
      
      setSnack({ open: true, msg: "Accepted… waiting for Finalized", severity: "info" });
      onAccepted?.();
      
      // Wait for FINALIZED in background (non-blocking UI)
      getClient()
        .waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 200, interval: 3000 })
        .then(async () => {
          if (!mountedRef.current) return;
          
          // Try to fetch actual points earned
          try {
            const newStats = await getMyStats() as StatsResponse | null;
            const newTotalScore = newStats?.total_score ?? 0;
            
            const pointsEarned = previousTotalScore !== null 
              ? Number(newTotalScore) - previousTotalScore 
              : null;
            
            const successMessage = pointsEarned !== null && pointsEarned > 0
              ? `🎉 You've checked in! +${pointsEarned} points earned.`
              : "🎉 Check-in successful! Points earned.";
            
            setSnack({ open: true, msg: successMessage, severity: "success" });
          } catch (error) {
            console.warn("Could not fetch points earned:", error);
            setSnack({ open: true, msg: "🎉 Check-in successful! Points earned.", severity: "success" });
          }
          
          setShowConfetti(true);
          
          // Store timeout ID for cleanup
          const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
              setShowConfetti(false);
            }
          }, 2000);
          timeoutsRef.current.add(timeoutId);
          
          if (mountedRef.current) {
            setDailyContent(""); // Clear content after successful check-in
          }
        })
        .catch(() => undefined);
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      const message = (e as Error)?.message || "Transaction failed";
      setSnack({ open: true, msg: message, severity: "error" });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  // Avoid hydration mismatch: render stable markup until mounted
  if (!mounted) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        mt: 6,
      }}>
        <TextField
          multiline
          rows={4}
          placeholder="How was your day? What did you learn or build?"
          disabled
          sx={{ width: '100%' }}
        />
        <Button variant="contained" disabled sx={{ px: 6, py: 1.5, borderRadius: 2.5 }}>
          Check In
        </Button>
      </Box>
    );
  }

  const getButtonText = () => {
    if (loading) return "Checking in...";
    if (disabled) return "Checked ✓";
    if (!isContentValid) return "Enter content to check in";
    return "Check In";
  };

  return (
    <>
      {/* Check-in Container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        mt: 6,
      }}>
        {/* Textarea */}
        <TextField
          key="checkin-textfield"
          label="How was your day?"
          aria-label="Daily check-in content"
          multiline
          rows={4}
          placeholder="How was your day? What did you learn or build?"
          value={dailyContent}
          onChange={(e) => setDailyContent(e.target.value)}
          disabled={loading || disabled}
          inputProps={{ maxLength: MAX_CONTENT }}
          error={!isContentValid && dailyContent.length > 0}
          helperText={`${dailyContent.length}/${MAX_CONTENT} characters`}
          sx={(theme) => ({
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
              border: `1px solid ${theme.palette.divider}`,
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              minHeight: '110px',
              padding: '14px 18px',
              fontSize: '14px',
              boxShadow: theme.palette.mode === 'dark' 
                ? 'inset 0 1px 2px rgba(255,255,255,0.02)' 
                : 'inset 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300]}`,
                backgroundColor: theme.palette.background.paper,
              },
              '&.Mui-focused': {
                border: `1px solid ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                opacity: 0.7,
                border: `1px solid ${theme.palette.divider}`,
              },
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              fontWeight: 400,
              fontSize: '13.5px',
              lineHeight: 1.5,
              '&::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 1,
                lineHeight: 1.5,
                fontSize: '13.5px',
              },
            },
            '& .MuiFormHelperText-root': {
              color: theme.palette.text.secondary,
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              fontWeight: 500,
              fontSize: '12px',
            },
          })}
        />
        
        {/* Button Container */}
        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {/* Confetti Effect */}
          {showConfetti && (
            <Box sx={(theme) => {
              const confettiColors = [
                theme.palette.success?.main || '#39FF14',
                theme.palette.primary?.main || '#1565c0',
                theme.palette.error?.main || '#ff6b6b',
                theme.palette.warning?.main || '#feca57'
              ];
              
              return {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
                '& > div': {
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  animation: `confetti 1.5s ease-out forwards`,
                  '@keyframes confetti': {
                    '0%': {
                      transform: 'translate(0, 0) rotate(0deg)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: `translate(${(Math.random() - 0.5) * 200}px, ${Math.random() * 200 + 100}px) rotate(720deg)`,
                      opacity: 0,
                    },
                  },
                }
              };
            }}>
              {[...Array(12)].map((_, i) => (
                <Box
                  key={i}
                  sx={(theme) => {
                    const confettiColors = [
                      theme.palette.success?.main || '#39FF14',
                      theme.palette.primary?.main || '#1565c0',
                      theme.palette.error?.main || '#ff6b6b',
                      theme.palette.warning?.main || '#feca57'
                    ];
                    
                    return {
                      bgcolor: confettiColors[i % 4],
                      animationDelay: `${i * 0.1}s`,
                    };
                  }}
                />
              ))}
            </Box>
          )}

          <Tooltip 
            title={disabled ? "You've already checked in today!" : ""} 
            placement="top"
            arrow
          >
            <span>
              <Button
                variant="contained"
                disableElevation
                sx={(theme) => ({
                  px: 6, 
                  py: 1.5, 
                  borderRadius: 2.5, 
                  fontWeight: 600, 
                  textTransform: "none",
                  fontSize: '15px',
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #16A34A 0%, #15803D 100%)'
                    : 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 10px rgba(22,163,74,0.4)'
                    : '0 4px 10px rgba(22,163,74,0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '140px',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 6px 14px rgba(22,163,74,0.5)'
                      : '0 6px 14px rgba(22,163,74,0.3)',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, #16A34A 0%, #15803D 100%)'
                      : 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
                  },
                  '&:active': {
                    transform: 'translateY(0px) scale(0.98)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 2px 8px rgba(22,163,74,0.4)'
                      : '0 2px 8px rgba(22,163,74,0.25)',
                  },
                  '&.Mui-disabled': { 
                    background: theme.palette.action.disabledBackground, 
                    color: theme.palette.text.disabled,
                    boxShadow: 'none',
                    transform: 'none',
                    cursor: 'not-allowed',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      background: theme.palette.action.disabledBackground,
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  },
                  transition: 'all 0.2s ease',
                })}
                onClick={handleCheckIn}
                disabled={loading || disabled || !isContentValid}
              >
                {getButtonText()}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Snackbar 
        open={!!snack?.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Alert 
          onClose={() => setSnack(null)} 
          severity={snack?.severity ?? "info"} 
          variant="filled" 
          sx={{ 
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
            fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          {snack?.msg ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}

