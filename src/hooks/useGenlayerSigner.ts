import { useEffect } from "react";
import { useAccount } from "wagmi";
import { attachSigner, initializeConsensusSmartContract } from "../lib/genlayer";
import type { EIP1193Provider } from "viem";

export function useGenlayerSigner() {
  const { isConnected, address } = useAccount();
  useEffect(() => {
    const eth = (globalThis as { ethereum?: EIP1193Provider })?.ethereum;
    if (isConnected && eth) {
      attachSigner(eth, address as `0x${string}`);
      // Initialize consensus smart contract after signer is attached
      initializeConsensusSmartContract().catch((error) => {
        console.error("Failed to initialize consensus smart contract:", error);
      });
    }
  }, [isConnected, address]);
}
