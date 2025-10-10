import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { EIP1193Provider, Address } from "viem";

let client = createClient({ chain: studionet, endpoint: process.env.NEXT_PUBLIC_GENLAYER_API_URL });

export function getClient() {
  return client;
}

const envAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "").trim();
export const hasValidContractAddress = /^0x[a-fA-F0-9]{40}$/.test(envAddress);
export const contractAddress = (hasValidContractAddress ? (envAddress as Address) : ("0x0000000000000000000000000000000000000000" as Address));

// attach signer from RainbowKit (EIP-1193 provider)
export function attachSigner(provider: EIP1193Provider | undefined, address?: Address) {
  client = createClient({
    chain: studionet,
    endpoint: process.env.NEXT_PUBLIC_GENLAYER_API_URL,
    provider,
    account: address,
  });
}

// Views
export async function getMyStats() {
  if (!hasValidContractAddress) throw new Error("Contract address is not set");
  return client.readContract({
    address: contractAddress,
    functionName: "get_my_stats",
    args: [],
  });
}

export async function isCheckedToday() {
  if (!hasValidContractAddress) return false;
  return client.readContract({
    address: contractAddress,
    functionName: "is_checked_today",
    args: [],
  });
}

export async function currentDayIndex() {
  if (!hasValidContractAddress) return 0;
  return client.readContract({
    address: contractAddress,
    functionName: "current_day_index",
    args: [],
  });
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

// Write
export async function checkIn() {
  if (!hasValidContractAddress) throw new Error("Contract address is not set");
  return client.writeContract({
    address: contractAddress,
    functionName: "check_in",
    args: [],
    value: BigInt(0),
  });
}

export { TransactionStatus } from "genlayer-js/types";

// Simple factory per spec
export const makeClient = (address?: Address) =>
  createClient({ chain: studionet, endpoint: process.env.NEXT_PUBLIC_GENLAYER_API_URL, account: address });
