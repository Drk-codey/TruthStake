import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_BETS, POLL_INTERVAL_MS } from '../constants';
import type { Bet, CreateBetInput } from '../types';

// In a real app, these hook implementations call genLayerClient.readContract / writeContract.
// For demo purposes, we simulate with local state + mock data so the UI is always functional.

let localBets: Bet[] = MOCK_BETS.map((b) => ({ ...b } as Bet));
let nextId = localBets.length + 1;

export const BET_KEYS = {
  all: ['bets'] as const,
  single: (id: number) => ['bets', id] as const,
};

async function fetchAllBets(): Promise<Bet[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600));
  return [...localBets];
}

async function fetchBet(id: number): Promise<Bet> {
  await new Promise((r) => setTimeout(r, 300));
  const bet = localBets.find((b) => b.id === id);
  if (!bet) throw new Error(`Bet #${id} not found`);
  return { ...bet };
}

export function useAllBets() {
  return useQuery<Bet[]>({
    queryKey: BET_KEYS.all,
    queryFn: fetchAllBets,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 10_000,
  });
}

export function useBet(id: number) {
  return useQuery<Bet>({
    queryKey: BET_KEYS.single(id),
    queryFn: () => fetchBet(id),
    staleTime: 10_000,
  });
}

export function useCreateBet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBetInput & { creator: string }) => {
      // Simulate blockchain confirmation delay (GenLayer consensus)
      await new Promise((r) => setTimeout(r, 4000));
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
        category: input.category,
      };
      localBets = [newBet, ...localBets];
      return newBet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}

export function useAcceptBet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ betId, taker }: { betId: number; taker: string }) => {
      await new Promise((r) => setTimeout(r, 3000));
      localBets = localBets.map((b) =>
        b.id === betId ? { ...b, no_address: taker } : b
      );
      return betId;
    },
    onSuccess: (_, { betId }) => {
      qc.invalidateQueries({ queryKey: BET_KEYS.single(betId) });
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}

export function useSettleBet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (betId: number) => {
      // Simulate AI reasoning time
      await new Promise((r) => setTimeout(r, 5000));
      const outcome: Bet['outcome'] = Math.random() > 0.5 ? 'YES' : 'NO';
      localBets = localBets.map((b) =>
        b.id === betId ? { ...b, settled: true, outcome } : b
      );
      return outcome;
    },
    onSuccess: (_, betId) => {
      qc.invalidateQueries({ queryKey: BET_KEYS.single(betId) });
      qc.invalidateQueries({ queryKey: BET_KEYS.all });
    },
  });
}
