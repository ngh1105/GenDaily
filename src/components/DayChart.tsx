"use client";
import { useMemo } from "react";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import CheckRounded from "@mui/icons-material/CheckRounded";
import { dayIndexToDateString } from "../lib/time";

type Props = {
  startDay: number;
  endDay: number;
  counts: number[] | undefined;
  loading?: boolean;
};

export default function DayChart({ startDay, endDay, counts, loading }: Props) {
  const days = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    const totalDays = endDay - startDay + 1;
    for (let i = 0; i < totalDays; i++) {
      const day = startDay + i;
      const value = counts?.[i] ?? 0;
      out.push({ label: dayIndexToDateString(day), value });
    }
    return out;
  }, [startDay, endDay, counts]);

  const NEON = "#39FF14";

  return (
    <Box sx={{ width: "100%", maxWidth: 640 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Last 7 days
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Stack direction="row" gap={2} alignItems="center" justifyContent="center" sx={{ mt: 1, flexWrap: "wrap" }}>
        {days.map((d, i) => {
          const checked = (d.value ?? 0) > 0; // simple: has check-in count for the day => tick
          return (
            <Stack key={d.label} spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  bgcolor: checked ? NEON : "action.hover",
                  color: checked ? "#000" : "text.secondary",
                  border: checked ? "2px solid #00c853" : "1px solid rgba(0,0,0,.08)",
                  boxShadow: checked ? `0 0 14px ${NEON}, inset 0 0 10px ${NEON}` : "inset 0 0 8px rgba(0,0,0,.06)",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  animation: `fadeIn .4s ease ${i * 60}ms both`,
                  "@keyframes fadeIn": { from: { opacity: 0, transform: "scale(.9)" }, to: { opacity: 1, transform: "scale(1)" } },
                  "&:hover": { transform: "translateY(-2px)" },
                }}
                aria-label={`${d.label}: ${d.value}`}
              >
                {checked && <CheckRounded sx={{ fontSize: 28 }} />}
              </Box>
              <Typography variant="caption" color="text.secondary">{d.label.slice(5)}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

