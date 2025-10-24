"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenlayerClient } from "./useGenlayerClient";
import { TransactionStatus } from "../lib/genlayer";
import { useAccount } from "wagmi";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x362DAaCBaca07c64E7C9fa32787A6c1F0001A076";

export function useCheckinAction() {
  const qc = useQueryClient();
  const { client, isReady } = useGenlayerClient();
  const { address } = useAccount();

  return useMutation({
    // Optional content param for enhanced contract; default to empty string for compatibility
    mutationFn: async (content: string = "") => {
      if (!client || !isReady) {
        throw new Error("Client not initialized");
      }
      const hash = await client.writeContract({
        address: CONTRACT as `0x${string}`,
        functionName: "checkin_sentence",
        args: [content],
        value: BigInt(0),
      });
      return hash;
    },
    onSuccess: (hash) => {
      qc.invalidateQueries({ queryKey: ["myStats", address, CONTRACT] });
      qc.invalidateQueries({ queryKey: ["checkedToday", CONTRACT, address] });
      qc.invalidateQueries({ queryKey: ["last7", address, CONTRACT] });
      qc.invalidateQueries({ queryKey: ["nextReset", address, CONTRACT] });
    },
    onError: (error) => {
      console.error("Error in useCheckinAction:", error);
    },
  });
}

