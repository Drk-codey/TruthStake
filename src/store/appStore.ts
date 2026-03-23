// src/store/appStore.ts
import { create } from 'zustand';
import type { BetOutcome, ConsensusState } from '../types';
import {
  getOrCreateWallet,
  saveWallet,
  canClaimFaucet,
  claimFaucet,
  getNextClaimTime,
  type StoredWallet,
} from '../lib/storage';
import { genLayerClient, CONTRACT_ADDRESS } from '../lib/genLayerClient';

interface WalletSlice {
  address: string | null;
  balance: number;
  lockedBalance: number;
  isConnected: boolean;
  wins: number;
  losses: number;
  totalWon: number;
  totalLost: number;
  transactions: StoredWallet['transactions'];
}

interface AppStore {
  wallet: WalletSlice;
  consensus: ConsensusState;
  isConsensusModalOpen: boolean;
  activeCategory: string;
  searchQuery: string;

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  claimDailyFaucet: () => void;
  canClaim: () => boolean;
  nextClaimTime: () => number | null;
  
  // Internal: sync wallet from storage
  _syncWalletFromStorage: () => void;
  _updateStoredWallet: (updater: (w: StoredWallet) => StoredWallet) => void;

  // Consensus modal
  openConsensusModal: (txHash: string) => void;
  closeConsensusModal: () => void;
  updateConsensus: (update: Partial<ConsensusState>) => void;

  // UI
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
}

function walletToSlice(w: StoredWallet, connected = true): WalletSlice {
  return {
    address: w.address,
    balance: w.balance,
    lockedBalance: w.lockedBalance,
    isConnected: connected,
    wins: w.wins,
    losses: w.losses,
    totalWon: w.totalWon,
    totalLost: w.totalLost,
    transactions: w.transactions,
  };
}

// Check if wallet was previously connected in this session
const SESSION_CONNECTED_KEY = 'ts_session_connected';

export const useAppStore = create<AppStore>((set, get) => ({
  wallet: {
    address: null,
    balance: 0,
    lockedBalance: 0,
    isConnected: false,
    wins: 0,
    losses: 0,
    totalWon: 0,
    totalLost: 0,
    transactions: [],
  },
  consensus: {
    txHash: null,
    status: 'idle',
    validatorCount: 5,
    agreementCount: 0,
    leaderProposal: null,
  },
  isConsensusModalOpen: false,
  activeCategory: 'all',
  searchQuery: '',

  connectWallet: async () => {
    // Simulate connection delay (wallet unlock UX)
    await new Promise((r) => setTimeout(r, 600));
    
    // Get or create local wallet identity
    const stored = getOrCreateWallet();
    
    // Register on-chain if first time
    try {
      await genLayerClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'register_user',
        args: [],
        value: 0n,
      });
    } catch {
      // Already registered — ignore
    }
    
    // Read on-chain balance
    let updated = stored;
    try {
      const onChainBalance = await genLayerClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_balance',
        args: [stored.address],
      });
      updated = { ...stored, balance: Number(onChainBalance) };
      saveWallet(updated);
    } catch {
      console.warn('Failed to read contract balance');
    }
    
    sessionStorage.setItem(SESSION_CONNECTED_KEY, '1');
    set({ wallet: walletToSlice(updated, true) });
  },

  disconnectWallet: () => {
    sessionStorage.removeItem(SESSION_CONNECTED_KEY);
    set({
      wallet: {
        address: null,
        balance: 0,
        lockedBalance: 0,
        isConnected: false,
        wins: 0,
        losses: 0,
        totalWon: 0,
        totalLost: 0,
        transactions: [],
      },
    });
  },

  claimDailyFaucet: () => {
    const stored = getOrCreateWallet();
    if (!canClaimFaucet(stored)) return;
    const updated = claimFaucet(stored);
    set({ wallet: walletToSlice(updated, true) });
  },

  canClaim: () => {
    const stored = getOrCreateWallet();
    return canClaimFaucet(stored);
  },

  nextClaimTime: () => {
    const stored = getOrCreateWallet();
    return getNextClaimTime(stored);
  },

  _syncWalletFromStorage: () => {
    const stored = getOrCreateWallet();
    const isConnected = !!sessionStorage.getItem(SESSION_CONNECTED_KEY);
    if (isConnected) {
      set({ wallet: walletToSlice(stored, true) });
    }
  },

  _updateStoredWallet: (updater) => {
    const stored = getOrCreateWallet();
    const updated = updater(stored);
    saveWallet(updated);
    set({ wallet: walletToSlice(updated, true) });
  },

  openConsensusModal: (txHash) => {
    set({
      isConsensusModalOpen: true,
      consensus: {
        txHash,
        status: 'pending',
        validatorCount: 5,
        agreementCount: 0,
        leaderProposal: null,
      },
    });
  },

  closeConsensusModal: () => set({ isConsensusModalOpen: false }),

  updateConsensus: (update) => {
    set((s) => ({ consensus: { ...s.consensus, ...update } }));
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

// Auto-restore wallet connection on app load
if (sessionStorage.getItem(SESSION_CONNECTED_KEY)) {
  setTimeout(() => useAppStore.getState()._syncWalletFromStorage(), 0);
}
