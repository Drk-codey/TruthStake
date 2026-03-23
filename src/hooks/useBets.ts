// src/hooks/useBets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Bet, CreateBetInput, BetOutcome, BetCategory } from '../types';
import {
  deductForBetCreate,
  deductForBetAccept,
  applyBetOutcome,
  refundBet,
  getOrCreateWallet,
} from '../lib/storage';
import { useAppStore } from '../store/appStore';
import { genLayerClient, CONTRACT_ADDRESS } from '../lib/genLayerClient';

export const BET_KEYS = {
  all: ['bets'] as const,
  single: (id: number) => ['bets', id] as const,
};

async function fetchAllBets(): Promise<Bet[]> {
  try {
    const bets = await genLayerClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_all_bets',
      args: [],
    });
    const arr = (bets as any[])?.map(b => ({
       id: Number(b.id),
       question: String(b.question),
       yes_address: String(b.yes_address),
       no_address: b.no_address ? String(b.no_address) : null,
       settlement_url: String(b.settlement_url),
       stake: Number(b.stake),
       pot: Number(b.pot),
       settled: Boolean(b.settled),
       outcome: (b.outcome ? String(b.outcome) : null) as BetOutcome,
       created_at: Number(b.created_at) * 1000,
       expires_at: Number(b.expires_at) * 1000,
       cancelled_at: b.cancelled_at ? Number(b.cancelled_at) * 1000 : undefined,
       category: String(b.category) as BetCategory,
       evidence_urls: JSON.parse(b.evidence_urls || '[]')
    })) ?? [];
    return arr.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
  } catch (err) {
    console.error("Failed to fetch bets from contract", err);
    return [];
  }
}

async function fetchBet(id: number): Promise<Bet> {
  const b = await genLayerClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_bet',
    args: [BigInt(id)],
  }) as any;
  if (!b) throw new Error("Bet not found");
  return {
       id: Number(b.id),
       question: String(b.question),
       yes_address: String(b.yes_address),
       no_address: b.no_address ? String(b.no_address) : null,
       settlement_url: String(b.settlement_url),
       stake: Number(b.stake),
       pot: Number(b.pot),
       settled: Boolean(b.settled),
       outcome: (b.outcome ? String(b.outcome) : null) as BetOutcome,
       created_at: Number(b.created_at) * 1000,
       expires_at: Number(b.expires_at) * 1000,
       cancelled_at: b.cancelled_at ? Number(b.cancelled_at) * 1000 : undefined,
       category: String(b.category) as BetCategory,
       evidence_urls: JSON.parse(b.evidence_urls || '[]')
  };
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

export function useCreateBet() {
  const qc = useQueryClient();
  const { _updateStoredWallet } = useAppStore();

  return useMutation({
    mutationFn: async (input: CreateBetInput & { creator: string }) => {
      const stored = getOrCreateWallet();
      if (stored.balance < input.stake_amount) {
        throw new Error(`Insufficient balance. You have ${stored.balance} GEN but need ${input.stake_amount} GEN.`);
      }

      const tx = await genLayerClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'create_bet',
        args: [
          input.question,
          input.settlement_url,
          BigInt(input.stake_amount),
          input.category,
          JSON.stringify(input.evidence_urls ?? []),
        ],
        value: 0n,
      });
      console.log('Created bet tx:', tx);
      await genLayerClient.waitForTransactionReceipt({ hash: tx as any });

      const betId = await genLayerClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_bet_count',
        args: [],
      });
      const newId = Number(betId) - 1;
      
      _updateStoredWallet((w) => deductForBetCreate(w, input.stake_amount, newId));
      return newId;
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
      const tx = await genLayerClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'accept_bet',
        args: [BigInt(betId)],
        value: 0n,
      });
      await genLayerClient.waitForTransactionReceipt({ hash: tx as any });
      
      const bet = await fetchBet(betId);
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
      const tx = await genLayerClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'settle_bet',
        args: [BigInt(betId)],
        value: 0n,
      });
      await genLayerClient.waitForTransactionReceipt({ hash: tx as any });
      
      const betInfo = await fetchBet(betId);
      const currentAddress = wallet.address?.toLowerCase();
      const userSide =
        betInfo.yes_address.toLowerCase() === currentAddress ? 'YES' :
        betInfo.no_address?.toLowerCase() === currentAddress ? 'NO' :
        null;

      if (userSide && betInfo.outcome) {
        _updateStoredWallet((w) =>
          applyBetOutcome(w, { id: betId, stake: betInfo.stake, outcome: betInfo.outcome as 'YES' | 'NO', userSide })
        );
      }

      return betInfo.outcome as BetOutcome;
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
      const tx = await genLayerClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'cancel_bet',
        args: [BigInt(betId)],
        value: 0n,
      });
      await genLayerClient.waitForTransactionReceipt({ hash: tx as any });

      const betInfo = await fetchBet(betId);
      _updateStoredWallet((w) => refundBet(w, betInfo.stake, betId));

      return betId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BET_KEYS.all }),
  });
}
