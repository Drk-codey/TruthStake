import { createClient, createAccount, chains } from 'genlayer-js';
import { NETWORK, PRIVATE_KEY } from '../constants';

const account = createAccount(PRIVATE_KEY);
// Type casting since testnet might be named differently or added later
const chain = (chains as any)[NETWORK] || chains.localnet;

export const genLayerClient = createClient({
  chain,
  account,
});

export { CONTRACT_ADDRESS } from '../constants';
