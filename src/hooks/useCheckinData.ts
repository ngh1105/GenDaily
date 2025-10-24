"use client";
import { useQuery } from "@tanstack/react-query";
import { useGenlayerClient } from "./useGenlayerClient";
import { useAccount } from "wagmi";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x362DAaCBaca07c64E7C9fa32787A6c1F0001A076";

export function useMyStats() {
  const { client, isReady } = useGenlayerClient();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["myStats", address, CONTRACT],
    queryFn: async () => {
      if (!client || !isReady) {
        throw new Error("Client not initialized");
      }
      const res = await client.readContract({ address: CONTRACT as `0x${string}`, functionName: "get_my_stats", args: [] });
      
      // Normalize: support tuple [last_day, streak, total, total_score] or object { last_day, streak, total, total_score }
      if (typeof res === "string") {
        try {
          const obj = JSON.parse(res);
          return {
            last_day: Number(obj?.last_day ?? 0),
            streak: Number(obj?.streak ?? 0),
            total: Number(obj?.total ?? 0),
            total_score: Number(obj?.total_score ?? 0),
          };
        } catch {
          // fallthrough
        }
      }
      // Map<string, unknown> case returned by client
      if (res && typeof res === "object" && typeof (res as { get?: () => unknown }).get === "function") {
        const m = res as Map<string, unknown>;
        const out = {
          last_day: Number(m.get("last_day") ?? 0),
          streak: Number(m.get("streak") ?? 0),
          total: Number(m.get("total") ?? 0),
          total_score: Number(m.get("total_score") ?? 0),
        };
        return out;
      }
      if (Array.isArray(res)) {
        const [last_day, streak, total, total_score] = res as unknown[];
        return { 
          last_day: Number(last_day ?? 0), 
          streak: Number(streak ?? 0), 
          total: Number(total ?? 0),
          total_score: Number(total_score ?? 0),
        };
      }
      const obj = res as Record<string, unknown>;
      return {
        last_day: Number(obj?.last_day ?? 0),
        streak: Number(obj?.streak ?? 0),
        total: Number(obj?.total ?? 0),
        total_score: Number(obj?.total_score ?? 0),
      };
    },
    enabled: Boolean(client && isReady && CONTRACT && address),
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useIsCheckedToday() {
  const { client, isReady } = useGenlayerClient();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["checkedToday", CONTRACT, address],
    queryFn: async () => {
      if (!client || !isReady) {
        throw new Error("Client not initialized");
      }
      return client.readContract({ address: CONTRACT as `0x${string}`, functionName: "is_checked_today", args: [] });
    },
    enabled: Boolean(client && isReady && CONTRACT && address),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useLast7Counts() {
  const { client, isReady } = useGenlayerClient();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["last7", address, CONTRACT],
    queryFn: async () => {
      if (!client || !isReady) {
        throw new Error("Client not initialized");
      }
      const day = await client.readContract({ address: CONTRACT as `0x${string}`, functionName: "current_day_index", args: [] });
      const start = Number(day) - 6;
      const arr = await client.readContract({ address: CONTRACT as `0x${string}`, functionName: "get_day_range_counts", args: [start, Number(day)] });
      return { arr: (arr as number[]).map(Number), start };
    },
    enabled: Boolean(client && isReady && CONTRACT && address),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useNextResetTime() {
  const { client, isReady } = useGenlayerClient();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["nextReset", address, CONTRACT],
    queryFn: async () => {
      if (!client || !isReady) {
        throw new Error("Client not initialized");
      }
      return Number(await client.readContract({ address: CONTRACT as `0x${string}`, functionName: "next_reset_time", args: [] }));
    },
    enabled: Boolean(client && isReady && CONTRACT && address),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30_000,
  });
}

