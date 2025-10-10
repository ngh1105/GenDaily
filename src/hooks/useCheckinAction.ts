"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenlayerClient } from "./useGenlayerClient";
import { TransactionStatus } from "../lib/genlayer";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export function useCheckinAction() {
  const qc = useQueryClient();
  const client = useGenlayerClient();

  return useMutation({
    mutationFn: async () => {
      const hash = await client.writeContract({ address: CONTRACT as `0x${string}`, functionName: "check_in", args: [], value: BigInt(0) });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 100, interval: 3000 });
      return hash;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myStats"] });
      qc.invalidateQueries({ queryKey: ["checkedToday"] });
      qc.invalidateQueries({ queryKey: ["last7"] });
    },
  });
}

