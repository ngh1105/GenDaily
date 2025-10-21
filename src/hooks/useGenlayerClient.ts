"use client";
import { useAccount } from "wagmi";
import { useEffect, useMemo } from "react";
import { getClient } from "../lib/genlayer";

/**
 * Hook lifecycle coordination:
 * 
 * 1. useGenlayerSigner runs first and calls attachSigner() to update singleton client
 * 2. useGenlayerClient retrieves the singleton client via getClient()
 * 3. Both hooks depend on isConnected/address changes to trigger updates
 * 4. This ensures signer is attached before client is used for operations
 * 
 * No global singleton mutation occurs in this hook - it only reads the singleton
 * that was updated by useGenlayerSigner via attachSigner().
 */
export function useGenlayerClient() {
  const { address, isConnected } = useAccount();
  
  // Get the singleton client instance managed by attachSigner/useGenlayerSigner
  // This avoids mutating the global singleton on every address/provider change
  const client = useMemo(() => getClient(), [isConnected, address]);

  useEffect(() => {
    // Initialize consensus if available - this will be idempotent
    (client as { initializeConsensusSmartContract?: () => Promise<void> }).initializeConsensusSmartContract?.().catch(() => {});
  }, [client]);

  return client;
}

