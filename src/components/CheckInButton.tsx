"use client";
import { useEffect, useState } from "react";
import { Button, Snackbar, Alert, Box } from "@mui/material";
import { checkIn, getClient, TransactionStatus } from "../lib/genlayer";

type Props = {
  disabled?: boolean;
  onAccepted?: () => void;
};

export default function CheckInButton({ disabled, onAccepted }: Props) {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => setMounted(true), []);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const hash = await checkIn();
      setSnack({ open: true, msg: "Accepted… waiting for Finalized", severity: "info" });
      onAccepted?.();
      
      // Wait for FINALIZED in background (non-blocking UI)
      getClient()
        .waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 200, interval: 3000 })
        .then(() => {
          setSnack({ open: true, msg: "Finalized", severity: "success" });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
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
      <Button variant="contained" disabled sx={{ px: 4, py: 1.4, borderRadius: 999 }}>
        Check In
      </Button>
    );
  }

  const getButtonText = () => {
    if (loading) return "Checking in...";
    if (disabled) return "Checked";
    return "Check In";
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
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

        <Button
          variant="contained"
          disableElevation
          sx={{
            px: 4, 
            py: 1.4, 
            borderRadius: 999, 
            fontWeight: 800, 
            textTransform: "none",
            fontSize: '1.1rem',
              bgcolor: '#1565c0',
              boxShadow: '0 12px 28px rgba(21,101,192,.35)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 16px 36px rgba(21,101,192,.45)',
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 8px 20px rgba(21,101,192,.3)',
            },
            '&.Mui-disabled': { 
              bgcolor: 'rgba(148,163,184,.25)', 
              color: 'text.secondary',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={handleCheckIn}
          disabled={loading || disabled}
        >
          {getButtonText()}
        </Button>
      </Box>

      <Snackbar 
        open={!!snack?.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnack(null)} 
          severity={snack?.severity ?? "info"} 
          variant="filled" 
          sx={{ 
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,.15)',
          }}
        >
          {snack?.msg ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}

