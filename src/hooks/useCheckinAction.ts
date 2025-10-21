"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenlayerClient } from "./useGenlayerClient";
import { TransactionStatus } from "../lib/genlayer";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x95758c22476ABC199C9A7698bFd083be84A08CF5";

export function useCheckinAction() {
  const qc = useQueryClient();
  const client = useGenlayerClient();

  return useMutation({
    // Optional content param for enhanced contract; default to empty string for compatibility
    mutationFn: async (content: string = "") => {
      const hash = await client.writeContract({
        address: CONTRACT as `0x${string}`,
        functionName: "checkin_sentence",
        args: [content],
        value: BigInt(0),
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 100, interval: 3000 });
      return hash;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myStats"] });
      qc.invalidateQueries({ queryKey: ["checkedToday"] });
      qc.invalidateQueries({ queryKey: ["last7"] });
      qc.invalidateQueries({ queryKey: ["nextReset"] });
    },
  });
}

