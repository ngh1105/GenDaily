import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { attachSigner, initializeConsensusSmartContract } from "../lib/genlayer";
import type { EIP1193Provider } from "viem";

export function useGenlayerSigner() {
  const { isConnected, address } = useAccount();
  const initializedAddressRef = useRef<string | null>(null);
  
  useEffect(() => {
    const eth = (globalThis as { ethereum?: EIP1193Provider })?.ethereum;
    
    // Guard: only proceed if connected, has ethereum provider, and has valid address
    if (isConnected && eth && address) {
      // Check if we've already initialized for this address
      if (initializedAddressRef.current !== address) {
        attachSigner(eth, address as `0x${string}`);
        
        // Initialize consensus smart contract after signer is attached
        initializeConsensusSmartContract()
          .then(() => {
            // Update ref to track successful initialization for this address
            initializedAddressRef.current = address;
            console.log(`Consensus smart contract initialized for address: ${address}`);
          })
          .catch((error) => {
            console.error("Failed to initialize consensus smart contract:", error);
            // Don't update ref on failure, allowing retry on next effect run
          });
      }
    } else if (!isConnected || !address) {
      // Reset initialization state when disconnected or no address
      initializedAddressRef.current = null;
    }
  }, [isConnected, address]);
}
