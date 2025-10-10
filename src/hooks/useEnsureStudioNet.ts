"use client";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { studioNet } from "../lib/walletConfig";

export function useEnsureStudioNet() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [needsSwitch, setNeedsSwitch] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setNeedsSwitch(false);
      return;
    }
    const ok = chainId === studioNet.id;
    setNeedsSwitch(!ok);
  }, [chainId, isConnected]);

  async function ensure() {
    if (needsSwitch) {
      try {
        await switchChainAsync({ chainId: studioNet.id });
        setNeedsSwitch(false);
      } catch {
        // ignore; caller can show guidance
      }
    }
  }

  return { needsSwitch, ensure };
}

