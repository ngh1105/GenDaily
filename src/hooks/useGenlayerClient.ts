"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getClient, initializeConsensusSmartContract } from "../lib/genlayer";

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize if connected and has address
    if (isConnected && address) {
      // Small delay to ensure signer is attached first
      const timer = setTimeout(() => {
        // Initialize consensus using the centralized, idempotent wrapper
        initializeConsensusSmartContract()
          .then(() => {
            setIsReady(true);
          })
          .catch((error) => {
            console.error("Failed to initialize consensus smart contract in useGenlayerClient:", error);
            setIsReady(false);
          });
      }, 100); // 100ms delay to ensure signer attachment completes

      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isConnected, address]);

  // Return fresh client reference on each render
  return { client: getClient(), isReady };
}

