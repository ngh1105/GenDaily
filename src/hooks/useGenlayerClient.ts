"use client";
import { useAccount } from "wagmi";
import { useEffect, useMemo } from "react";
import { makeClient } from "../lib/genlayer";
import type { Address, EIP1193Provider } from "viem";

export function useGenlayerClient() {
  const { address } = useAccount();
  
  // Get provider from globalThis.ethereum
  const provider = useMemo(() => {
    return (globalThis as { ethereum?: EIP1193Provider })?.ethereum;
  }, []);
  
  // Create client with provider to ensure it's signed
  const client = useMemo(() => makeClient(address as Address | undefined, provider), [address, provider]);

  useEffect(() => {
    // Initialize consensus if available - this will be idempotent
    (client as { initializeConsensusSmartContract?: () => Promise<void> }).initializeConsensusSmartContract?.().catch(() => {});
  }, [client]);

  return client;
}

