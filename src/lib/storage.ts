// src/lib/storage.ts
// Thin localStorage abstraction for TruthStake persistence

import type { Bet } from '../types';

export interface StoredWallet {
  address: string;
  balance: number;
  lockedBalance: number;      // Stakes locked in open/matched bets
  lastClaim: number | null;   // Unix timestamp of last faucet claim
  createdAt: number;
  wins: number;
  losses: number;
  totalWon: number;           // Cumulative GEN won
  totalLost: number;          // Cumulative GEN lost
  transactions: StoredTransaction[];
}

export interface StoredTransaction {
  id: string;
  type: 'faucet' | 'bet_created' | 'bet_accepted' | 'win' | 'loss' | 'refund' | 'cancel';
  amount: number;             // Positive = received, Negative = spent
  betId?: number;
  timestamp: number;
  description: string;
}

const KEYS = {
  WALLET: 'ts_wallet_v2',
  BETS: 'ts_bets_v2',
} as const;

const STARTING_BALANCE = 1000;
const FAUCET_AMOUNT = 1000;
const FAUCET_COOLDOWN_MS = 86_400_000; // 24 hours

// ── Wallet ──────────────────────────────────────────────────────────

function generateAddress(): string {
  // Generate a deterministic-looking hex address from a random UUID
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `0x${uuid}${'0'.repeat(40 - uuid.length)}`.slice(0, 42);
}

export function getOrCreateWallet(): StoredWallet {
  try {
    const raw = localStorage.getItem(KEYS.WALLET);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredWallet>;
      // Migration: add missing fields for older stored wallets
      return {
        lockedBalance: 0,
        wins: 0,
        losses: 0,
        totalWon: 0,
        totalLost: 0,
        transactions: [],
        ...parsed,
      } as StoredWallet;
    }
  } catch {
    // Corrupt storage — create fresh
  }

  const fresh: StoredWallet = {
    address: generateAddress(),
    balance: STARTING_BALANCE,
    lockedBalance: 0,
    lastClaim: null,
    createdAt: Date.now(),
    wins: 0,
    losses: 0,
    totalWon: 0,
    totalLost: 0,
    transactions: [
      {
        id: crypto.randomUUID(),
        type: 'faucet',
        amount: STARTING_BALANCE,
        timestamp: Date.now(),
        description: 'Welcome bonus — 1,000 GEN to start your journey',
      },
    ],
  };

  saveWallet(fresh);
  return fresh;
}

export function saveWallet(wallet: StoredWallet): void {
  localStorage.setItem(KEYS.WALLET, JSON.stringify(wallet));
}

export function canClaimFaucet(wallet: StoredWallet): boolean {
  if (wallet.lastClaim === null) return false; // New users already got welcome bonus
  return Date.now() - wallet.lastClaim >= FAUCET_COOLDOWN_MS;
}

export function getNextClaimTime(wallet: StoredWallet): number | null {
  if (wallet.lastClaim === null) return null;
  const next = wallet.lastClaim + FAUCET_COOLDOWN_MS;
  return next > Date.now() ? next : null;
}

export function claimFaucet(wallet: StoredWallet): StoredWallet {
  if (!canClaimFaucet(wallet)) throw new Error('Faucet not ready');
  const tx: StoredTransaction = {
    id: crypto.randomUUID(),
    type: 'faucet',
    amount: FAUCET_AMOUNT,
    timestamp: Date.now(),
    description: 'Daily claim — 1,000 GEN',
  };
  const updated: StoredWallet = {
    ...wallet,
    balance: wallet.balance + FAUCET_AMOUNT,
    lastClaim: Date.now(),
    transactions: [tx, ...wallet.transactions].slice(0, 100), // Keep last 100
  };
  saveWallet(updated);
  return updated;
}

// ── Balance mutations ────────────────────────────────────────────────

export function deductForBetCreate(wallet: StoredWallet, stake: number, betId: number): StoredWallet {
  if (wallet.balance < stake) throw new Error('Insufficient balance');
  const tx: StoredTransaction = {
    id: crypto.randomUUID(),
    type: 'bet_created',
    amount: -stake,
    betId,
    timestamp: Date.now(),
    description: `Staked ${stake} GEN on Bet #${betId} (YES side)`,
  };
  const updated: StoredWallet = {
    ...wallet,
    balance: wallet.balance - stake,
    lockedBalance: wallet.lockedBalance + stake,
    transactions: [tx, ...wallet.transactions].slice(0, 100),
  };
  saveWallet(updated);
  return updated;
}

export function deductForBetAccept(wallet: StoredWallet, stake: number, betId: number): StoredWallet {
  if (wallet.balance < stake) throw new Error('Insufficient balance');
  const tx: StoredTransaction = {
    id: crypto.randomUUID(),
    type: 'bet_accepted',
    amount: -stake,
    betId,
    timestamp: Date.now(),
    description: `Staked ${stake} GEN on Bet #${betId} (NO side)`,
  };
  const updated: StoredWallet = {
    ...wallet,
    balance: wallet.balance - stake,
    lockedBalance: wallet.lockedBalance + stake,
    transactions: [tx, ...wallet.transactions].slice(0, 100),
  };
  saveWallet(updated);
  return updated;
}

export function applyBetOutcome(
  wallet: StoredWallet,
  bet: { id: number; stake: number; outcome: 'YES' | 'NO'; userSide: 'YES' | 'NO' }
): StoredWallet {
  const { id: betId, stake, outcome, userSide } = bet;
  const won = outcome === userSide;
  const payout = won ? stake * 2 : 0; // Winner gets both stakes back
  const tx: StoredTransaction = {
    id: crypto.randomUUID(),
    type: won ? 'win' : 'loss',
    amount: won ? stake : -stake, // Net change (already deducted on entry)
    betId,
    timestamp: Date.now(),
    description: won
      ? `Won Bet #${betId} — +${stake * 2} GEN (net +${stake})`
      : `Lost Bet #${betId} — stake forfeited`,
  };
  const updated: StoredWallet = {
    ...wallet,
    balance: wallet.balance + payout,
    lockedBalance: Math.max(0, wallet.lockedBalance - stake),
    wins: won ? wallet.wins + 1 : wallet.wins,
    losses: won ? wallet.losses : wallet.losses + 1,
    totalWon: won ? wallet.totalWon + stake : wallet.totalWon,
    totalLost: won ? wallet.totalLost : wallet.totalLost + stake,
    transactions: [tx, ...wallet.transactions].slice(0, 100),
  };
  saveWallet(updated);
  return updated;
}

export function refundBet(wallet: StoredWallet, stake: number, betId: number): StoredWallet {
  const tx: StoredTransaction = {
    id: crypto.randomUUID(),
    type: 'refund',
    amount: stake,
    betId,
    timestamp: Date.now(),
    description: `Refunded ${stake} GEN from cancelled Bet #${betId}`,
  };
  const updated: StoredWallet = {
    ...wallet,
    balance: wallet.balance + stake,
    lockedBalance: Math.max(0, wallet.lockedBalance - stake),
    transactions: [tx, ...wallet.transactions].slice(0, 100),
  };
  saveWallet(updated);
  return updated;
}

// ── Bets ─────────────────────────────────────────────────────────────

export function loadBets(): Bet[] {
  try {
    const raw = localStorage.getItem(KEYS.BETS);
    return raw ? (JSON.parse(raw) as Bet[]) : [];
  } catch {
    return [];
  }
}

export function saveBets(bets: Bet[]): void {
  localStorage.setItem(KEYS.BETS, JSON.stringify(bets));
}
