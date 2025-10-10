"use client";
import { useAccount } from "wagmi";
import { useEffect, useMemo } from "react";
import { makeClient } from "../lib/genlayer";
import type { Address } from "viem";

export function useGenlayerClient() {
  const { address } = useAccount();
  const client = useMemo(() => makeClient(address as Address | undefined), [address]);

  useEffect(() => {
    // initialize consensus if available
    (client as { initializeConsensusSmartContract?: () => Promise<void> }).initializeConsensusSmartContract?.().catch(() => {});
  }, [client]);

  return client;
}

