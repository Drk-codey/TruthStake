// src/hooks/useBets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_BETS } from '../constants';
import type { Bet, CreateBetInput, BetOutcome } from '../types';
import {
  loadBets,
  saveBets,
  deductForBetCreate,
  deductForBetAccept,
  applyBetOutcome,
  refundBet,
  getOrCreateWallet,
} from '../lib/storage';
import { useAppStore } from '../store/appStore';

// ── Seed mock bets on first load if storage is empty ─────────────────
function getInitialBets(): Bet[] {
  const stored = loadBets();
  if (stored.length > 0) return stored;

  // Seed with mock data — cast to full Bet shape
  const seeded: Bet[] = MOCK_BETS.map((b, i) => ({
    ...b,
    id: i + 1,
    expires_at: Date.now() + 72 * 60 * 60 * 1000 - i * 3600_000,
    pot: b.no_address ? b.stake * 2 : b.stake,
    evidence_urls: [],
  }));
  saveBets(seeded);
  return seeded;
}

let localBets: Bet[] = getInitialBets();
let nextId = localBets.reduce((max, b) => Math.max(max, b.id), 0) + 1;

// ── Simulated AI settlement ──────────────────────────────────────────
async function simulateAISettlement(bet: Bet): Promise<BetOutcome> {
  // In production: genLayerClient calls the contract's settle_bet()
  // For demo: simulate based on question type with weighted probability
  await new Promise((r) => setTimeout(r, 4500));
  const q = bet.question.toLowerCase();

  // Category-based bias for more realistic feel
  let yesWeight = 0.5;
  if (q.includes('rain') || q.includes('weather')) yesWeight = 0.45;
  if (q.includes('win') || q.includes('beat') || q.includes('qualify')) yesWeight = 0.4;
  if (q.includes('bitcoin') || q.includes('price') || q.includes('hit')) yesWeight = 0.35;
  if (q.includes('will not') || q.includes("won't") || q.includes('unlikely')) yesWeight = 0.3;

  return Math.random() < yesWeight ? 'YES' : 'NO';
}

// ── Query keys ───────────────────────────────────────────────────────
export const BET_KEYS = {
  all: ['bets'] as const,
  single: (id: number) => ['bets', id] as const,
};

// ── Queries ──────────────────────────────────────────────────────────
async function fetchAllBets(): Promise<Bet[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [...localBets].sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
}

async function fetchBet(id: number): Promise<Bet> {
  await new Promise((r) => setTimeout(r, 200));
  const bet = localBets.find((b) => b.id === id);
  if (!bet) throw new Error(`Bet #${id} not found`);
  return { ...bet };
}

export function useAllBets() {
  return useQuery<Bet[]>({
    queryKey: BET_KEYS.all,
    queryFn: fetchAllBets,
    refetchInterval: 15_000,
    staleTime: 8_000,
  });
}

export function useBet(id: number) {
  return useQuery<Bet>({
    queryKey: BET_KEYS.single(id),
    queryFn: () => fetchBet(id),
    staleTime: 8_000,
  });
}

// ── Mutations ────────────────────────────────────────────────────────
export function useCreateBet() {
  const qc = useQueryClient();
  const { _updateStoredWallet } = useAppStore();

  return useMutation({
    mutationFn: async (input: CreateBetInput & { creator: string }) => {
      // 1. Validate balance
      const stored = getOrCreateWallet();
      if (stored.balance < input.stake_amount) {
        throw new Error(`Insufficient balance. You have ${stored.balance} GEN but need ${input.stake_amount} GEN.`);
      }

      // 2. Simulate consensus delay
      await new Promise((r) => setTimeout(r, 3500));

      // 3. Create the bet
      const newBet: Bet = {
        id: nextId++,
        question: input.question,
        yes_address: input.creator,
        no_address: null,
        settlement_url: input.settlement_url,
        stake: input.stake_amount,
        settled: false,
        outcome: null,
        created_at: Date.now(),
        expires_at: Date.now() + 72 * 60 * 60 * 1000, // 72 hours
        pot: input.stake_amount,
        category: input.category,
        evidence_urls: input.evidence_urls ?? [],
      };

      // 4. Deduct stake from wallet
      _updateStoredWallet((w) => deductForBetCreate(w, input.stake_amount, newBet.id));

      // 5. Persist bet
      localBets = [newBet, ...localBets];
      saveBets(localBets);

      return newBet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}

export function useAcceptBet() {
  const qc = useQueryClient();
  const { _updateStoredWallet } = useAppStore();

  return useMutation({
    mutationFn: async ({ betId, taker }: { betId: number; taker: string }) => {
      const bet = localBets.find((b) => b.id === betId);
      if (!bet) throw new Error('Bet not found');
      if (bet.no_address) throw new Error('Bet already accepted');
      if (bet.settled) throw new Error('Bet already settled');
      if (bet.yes_address.toLowerCase() === taker.toLowerCase()) {
        throw new Error("You cannot accept your own bet");
      }

      // Validate balance
      const stored = getOrCreateWallet();
      if (stored.balance < bet.stake) {
        throw new Error(`Insufficient balance. You need ${bet.stake} GEN to accept this bet.`);
      }

      // Simulate consensus delay
      await new Promise((r) => setTimeout(r, 2800));

      // Update bet
      localBets = localBets.map((b) =>
        b.id === betId
          ? { ...b, no_address: taker, pot: b.stake * 2 }
          : b
      );
      saveBets(localBets);

      // Deduct stake from taker's wallet
      _updateStoredWallet((w) => deductForBetAccept(w, bet.stake, betId));

      return betId;
    },
    onSuccess: (betId) => {
      qc.invalidateQueries({ queryKey: BET_KEYS.single(betId) });
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}

export function useSettleBet() {
  const qc = useQueryClient();
  const { _updateStoredWallet, wallet } = useAppStore();

  return useMutation({
    mutationFn: async (betId: number) => {
      const bet = localBets.find((b) => b.id === betId);
      if (!bet) throw new Error('Bet not found');
      if (bet.settled) throw new Error('Bet already settled');
      if (!bet.no_address) throw new Error('Bet must be accepted before settling');

      // Run AI settlement simulation
      const outcome = await simulateAISettlement(bet);

      // Update bet state
      localBets = localBets.map((b) =>
        b.id === betId ? { ...b, settled: true, outcome } : b
      );
      saveBets(localBets);

      // Apply financial outcome to current user's wallet
      const currentAddress = wallet.address?.toLowerCase();
      const userSide: 'YES' | 'NO' | null =
        bet.yes_address.toLowerCase() === currentAddress ? 'YES' :
        bet.no_address?.toLowerCase() === currentAddress ? 'NO' :
        null;

      if (userSide) {
        _updateStoredWallet((w) =>
          applyBetOutcome(w, { id: betId, stake: bet.stake, outcome: outcome as 'YES' | 'NO', userSide })
        );
      }

      return outcome;
    },
    onSuccess: (_, betId) => {
      qc.invalidateQueries({ queryKey: BET_KEYS.single(betId) });
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}

export function useCancelBet() {
  const qc = useQueryClient();
  const { _updateStoredWallet } = useAppStore();

  return useMutation({
    mutationFn: async ({ betId, creator }: { betId: number; creator: string }) => {
      const bet = localBets.find((b) => b.id === betId);
      if (!bet) throw new Error('Bet not found');
      if (bet.settled) throw new Error('Cannot cancel a settled bet');
      if (bet.no_address) throw new Error('Cannot cancel a matched bet');
      if (bet.yes_address.toLowerCase() !== creator.toLowerCase()) {
        throw new Error('Only the creator can cancel this bet');
      }

      await new Promise((r) => setTimeout(r, 1200));

      localBets = localBets.map((b) =>
        b.id === betId ? { ...b, cancelled_at: Date.now() } : b
      );
      saveBets(localBets);

      // Refund creator's stake
      _updateStoredWallet((w) => refundBet(w, bet.stake, betId));

      return betId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BET_KEYS.all }),
  });
}
