import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define StudioNet if not available in wagmi/chains
export const studioNet = defineChain({
  id: 61999,
  name: 'GenLayer StudioNet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://studio.genlayer.com/api'] },
  },
});

export const config = createConfig({
  chains: [studioNet],
  transports: {
    [studioNet.id]: http('https://studio.genlayer.com/api'),
  },
  connectors: [injected({ target: 'metaMask' })],
});
