// src/lib/genLayerClient.ts
// genlayer-js v0.22.x API shape — no { chain, account } constructor
import { createClient } from 'genlayer-js';

const endpoint = import.meta.env.VITE_NETWORK === 'testnet'
  ? 'https://studio.genlayer.com:8443/api'
  : 'http://localhost:4000/api';

export const genLayerClient = createClient({ endpoint } as any);
export { CONTRACT_ADDRESS } from '../constants';
