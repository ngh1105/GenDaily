import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { EIP1193Provider, Address } from "viem";

// Extract endpoint resolution to avoid duplication
const resolveEndpoint = () => process.env.NEXT_PUBLIC_GENLAYER_API_URL || "https://studio.genlayer.com/api";

// Singleton client instance - always use this for consistency
let client = createClient({ 
  chain: studionet, 
  endpoint: resolveEndpoint() 
});

// Track initialization state to prevent double-init
let isInitialized = false;

export function getClient() {
  return client;
}

const envAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x95758c22476ABC199C9A7698bFd083be84A08CF5").trim();
export const hasValidContractAddress = /^0x[a-fA-F0-9]{40}$/.test(envAddress);
export const contractAddress = (hasValidContractAddress ? (envAddress as Address) : ("0x95758c22476ABC199C9A7698bFd083be84A08CF5" as Address));

// attach signer from RainbowKit (EIP-1193 provider)
export function attachSigner(provider: EIP1193Provider | undefined, address?: Address) {
  client = createClient({
    chain: studionet,
    endpoint: resolveEndpoint(),
    provider,
    account: address,
  });
  // Reset initialization state when signer changes
  isInitialized = false;
}

// Initialize consensus smart contract (idempotent)
export async function initializeConsensusSmartContract() {
  if (isInitialized) {
    console.log("Consensus smart contract already initialized, skipping");
    return;
  }
  
  try {
    await client.initializeConsensusSmartContract();
    isInitialized = true;
    console.log("Consensus smart contract initialized successfully");
  } catch (error) {
    console.error("Failed to initialize consensus smart contract:", error);
    throw error;
  }
}

// Views
export async function getMyStats() {
  if (!hasValidContractAddress) {
    console.warn("Contract address is not set, using default");
  }
  try {
    return await client.readContract({
      address: contractAddress,
      functionName: "get_my_stats",
      args: [],
    });
  } catch (error) {
    console.error("Error calling get_my_stats:", error);
    throw error;
  }
}

export async function isCheckedToday() {
  if (!hasValidContractAddress) {
    console.warn("Contract address is not set, using default");
  }
  try {
    return await client.readContract({
      address: contractAddress,
      functionName: "is_checked_today",
      args: [],
    });
  } catch (error) {
    console.error("Error calling is_checked_today:", error);
    return false;
  }
}

export async function currentDayIndex() {
  if (!hasValidContractAddress) {
    console.warn("Contract address is not set, using default");
  }
  try {
    return await client.readContract({
      address: contractAddress,
      functionName: "current_day_index",
      args: [],
    });
  } catch (error) {
    console.error("Error calling current_day_index:", error);
    return 0;
  }
}

export async function nextResetTime() {
  if (!hasValidContractAddress) return 0;
  return client.readContract({
    address: contractAddress,
    functionName: "next_reset_time",
    args: [],
  });
}

export async function getDayRangeCounts(start: number, end: number) {
  if (!hasValidContractAddress) return Array.from({ length: Math.max(0, end - start + 1) }, () => 0);
  return client.readContract({
    address: contractAddress,
    functionName: "get_day_range_counts",
    args: [start, end],
  });
}

// Write - Enhanced check-in with content
export async function checkInWithContent(content: string) {
  if (!hasValidContractAddress) throw new Error("Contract address is not set");
  return client.writeContract({
    address: contractAddress,
    functionName: "checkin_sentence",
    args: [content],
    value: BigInt(0),
  });
}

// Legacy check-in method (for backward compatibility)
export async function checkIn() {
  if (!hasValidContractAddress) throw new Error("Contract address is not set");
  return client.writeContract({
    address: contractAddress,
    functionName: "checkin_sentence",
    args: [""], // Empty content for legacy behavior
    value: BigInt(0),
  });
}

// Enhanced views
export async function getMyTodayCid() {
  if (!hasValidContractAddress) return 0;
  return client.readContract({
    address: contractAddress,
    functionName: "my_today_cid",
    args: [],
  });
}

export async function getCheckin(cid: number) {
  if (!hasValidContractAddress) return {};
  return client.readContract({
    address: contractAddress,
    functionName: "get_checkin",
    args: [cid],
  });
}

export async function getPolicy() {
  if (!hasValidContractAddress) return {};
  return client.readContract({
    address: contractAddress,
    functionName: "get_policy",
    args: [],
  });
}

export { TransactionStatus } from "genlayer-js/types";

// Unified factory - always returns the singleton client with optional provider/account
export const makeClient = (address?: Address, provider?: EIP1193Provider) => {
  // If provider is provided, update the singleton client
  if (provider) {
    client = createClient({
      chain: studionet,
      endpoint: resolveEndpoint(),
      provider,
      account: address,
    });
    // Reset initialization state when client changes
    isInitialized = false;
  }
  // Always return the singleton client
  return client;
};
