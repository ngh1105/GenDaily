"use client";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { makeClient } from "../lib/genlayer";
import type { Address, EIP1193Provider } from "viem";

export function useGenlayerClient() {
  const { address, isConnected } = useAccount();
  
  // State to track provider changes when wallet extension loads
  const [provider, setProvider] = useState<EIP1193Provider | undefined>(undefined);
  
  // Update provider when wallet connection state changes
  useEffect(() => {
    const ethereum = (globalThis as { ethereum?: EIP1193Provider })?.ethereum;
    setProvider(ethereum);
  }, [isConnected, address]);
  
  // Create client with provider to ensure it's signed
  const client = useMemo(() => makeClient(address as Address | undefined, provider), [address, provider]);

  useEffect(() => {
    // Initialize consensus if available - this will be idempotent
    (client as { initializeConsensusSmartContract?: () => Promise<void> }).initializeConsensusSmartContract?.().catch(() => {});
  }, [client]);

  return client;
}

