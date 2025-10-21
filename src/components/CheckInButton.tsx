"use client";
import { useEffect, useState } from "react";
import { Button, Snackbar, Alert, Box, TextField, Stack, Tooltip } from "@mui/material";
import { checkInWithContent, getClient, TransactionStatus } from "../lib/genlayer";

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
  
  // Content validation constants
  const MAX_CONTENT = 280;
  const content = dailyContent.trim();
  const isContentValid = content.length > 0 && content.length <= MAX_CONTENT;
  
  useEffect(() => setMounted(true), []);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const hash = await checkInWithContent(dailyContent);
      setSnack({ open: true, msg: "Accepted… waiting for Finalized", severity: "info" });
      onAccepted?.();
      
      // Wait for FINALIZED in background (non-blocking UI)
      getClient()
        .waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 200, interval: 3000 })
        .then(() => {
          setSnack({ open: true, msg: "🎉 You've checked in! +500 points earned.", severity: "success" });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          setDailyContent(""); // Clear content after successful check-in
        })
        .catch(() => undefined);
    } catch (e: unknown) {
      const message = (e as Error)?.message || "Transaction failed";
      setSnack({ open: true, msg: message, severity: "error" });
    } finally {
      setLoading(false);
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
          label="Daily check-in"
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
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              minHeight: '110px',
              padding: '14px 18px',
              fontSize: '14px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
              },
              '&.Mui-focused': {
                border: '1px solid #3B82F6',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
              },
              '&.Mui-disabled': {
                backgroundColor: '#F3F4F6',
                opacity: 0.7,
                border: '1px solid #E5E7EB',
              },
            },
            '& .MuiInputBase-input': {
              color: '#111827',
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              fontWeight: 400,
              fontSize: '13.5px',
              lineHeight: 1.5,
              '&::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
                lineHeight: 1.5,
                fontSize: '13.5px',
              },
            },
            '& .MuiFormHelperText-root': {
              color: '#6B7280',
              fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
              fontWeight: 500,
              fontSize: '12px',
            },
          }}
        />
        
        {/* Button Container */}
        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {/* Confetti Effect */}
          {showConfetti && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}>
              {[...Array(12)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: ['#39FF14', '#1565c0', '#ff6b6b', '#feca57'][i % 4],
                    animation: `confetti 1.5s ease-out forwards`,
                    animationDelay: `${i * 0.1}s`,
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
                  }}
                />
              ))}
            </Box>
          )}

          <Tooltip 
            title={disabled ? "Bạn đã check-in hôm nay rồi!" : ""} 
            placement="top"
            arrow
          >
            <span>
              <Button
                variant="contained"
                disableElevation
                sx={{
                  px: 6, 
                  py: 1.5, 
                  borderRadius: 2.5, 
                  fontWeight: 600, 
                  textTransform: "none",
                  fontSize: '15px',
                  fontFamily: '"Inter", "Outfit", "Manrope", sans-serif',
                  background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
                  boxShadow: '0 4px 10px rgba(22,163,74,0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '140px',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 14px rgba(22,163,74,0.3)',
                    background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
                  },
                  '&:active': {
                    transform: 'translateY(0px) scale(0.98)',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                  },
                  '&.Mui-disabled': { 
                    background: '#E5E7EB', 
                    color: '#9CA3AF',
                    boxShadow: 'none',
                    transform: 'none',
                    cursor: 'not-allowed',
                    border: '1px solid #D1D5DB',
                    '&:hover': {
                      background: '#E5E7EB',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  },
                  transition: 'all 0.2s ease',
                }}
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

