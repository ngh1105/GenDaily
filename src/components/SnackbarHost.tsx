"use client";
import { Snackbar, Alert } from "@mui/material";
import { useState, useCallback } from "react";

export type Snack = { open: boolean; message: string; severity?: "success" | "error" | "info" | "warning" };

export default function SnackbarHost() {
  const [snack, setSnack] = useState<Snack | null>(null);
  const show = useCallback((s: Snack) => setSnack(s), []);
  // expose a global helper
  (globalThis as { __snack?: (snack: Snack) => void }).__snack = show;
  return (
    <Snackbar open={!!snack?.open} autoHideDuration={4000} onClose={() => setSnack(null)}>
      <Alert onClose={() => setSnack(null)} severity={snack?.severity ?? "info"} variant="filled" sx={{ width: "100%" }}>
        {snack?.message ?? ""}
      </Alert>
    </Snackbar>
  );
}

