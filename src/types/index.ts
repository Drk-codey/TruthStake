export type BetStatus = 'open' | 'matched' | 'settling' | 'settled' | 'appealed';
export type BetOutcome = 'YES' | 'NO' | null;

export type BetCategory =
  | 'weather'
  | 'sports'
  | 'politics'
  | 'crypto'
  | 'entertainment'
  | 'custom';

export interface Bet {
  id: number;
  question: string;
  yes_address: string;
  no_address: string | null;
  settlement_url: string;
  stake: number;
  settled: boolean;
  outcome: BetOutcome;
  created_at?: number;
  category?: BetCategory;
  // NEW FIELDS:
  expires_at: number;         // Unix ms — 72h after creation, after which creator can cancel
  cancelled_at?: number;      // Set when creator cancels an unmatched bet
  pot: number;                // stake * 2 when matched, stake when open
  evidence_urls?: string[];   // Optional supporting URLs
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface CreateBetInput {
  question: string;
  settlement_url: string;
  stake_amount: number;
  category: BetCategory;
  expiry_hint?: string;
  evidence_urls?: string[];   // NEW
}

export interface ConsensusState {
  txHash: string | null;
  status: 'idle' | 'pending' | 'confirming' | 'finalizing' | 'done' | 'failed';
  validatorCount: number;
  agreementCount: number;
  leaderProposal: BetOutcome;
}

export interface FilterState {
  search: string;
  category: BetCategory | 'all';
  status: BetStatus | 'all';
  sortBy: 'newest' | 'highest-stake' | 'soonest-expiry' | 'most-matched';
}

// Re-export StoredWallet and StoredTransaction from storage.ts
export type { StoredWallet, StoredTransaction } from '../lib/storage';
