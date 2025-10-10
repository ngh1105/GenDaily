// src/lib/wallet.ts
import { BrowserProvider } from "ethers";
import type { EIP1193Provider } from "viem";

export async function getEthersProvider() {
  const { ethereum } = window as unknown as { ethereum?: EIP1193Provider };
  if (!ethereum) throw new Error("MetaMask not detected");
  return new BrowserProvider(ethereum);
}

export async function getSigner() {
  const provider = await getEthersProvider();
  return provider.getSigner();
}
