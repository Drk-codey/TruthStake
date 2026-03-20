import { create } from 'zustand';
import type { WalletState, ConsensusState, BetOutcome } from '../types';
import { truncateAddress } from '../lib/formatters';

interface AppStore {
  wallet: Omit<WalletState, 'connect' | 'disconnect'>;
  consensus: ConsensusState;
  isConsensusModalOpen: boolean;
  isCreateBetModalOpen: boolean;
  activeCategory: string;
  searchQuery: string;

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Consensus actions
  openConsensusModal: (txHash: string) => void;
  closeConsensusModal: () => void;
  updateConsensus: (update: Partial<ConsensusState>) => void;

  // UI actions
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  openCreateBetModal: () => void;
  closeCreateBetModal: () => void;
}

// Simulate mock wallet addresses for demo
const DEMO_ADDRESSES = [
  '0x3f4a8b2c1d9e0f5a7b6c3d8e4f1a2b3c4d5e6f7a',
  '0xabc123def456abc123def456abc123def456abc1',
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
];

export const useAppStore = create<AppStore>((set) => ({
  wallet: {
    address: null,
    isConnected: false,
    balance: 0,
  },
  consensus: {
    txHash: null,
    status: 'idle',
    validatorCount: 5,
    agreementCount: 0,
    leaderProposal: null,
  },
  isConsensusModalOpen: false,
  isCreateBetModalOpen: false,
  activeCategory: 'all',
  searchQuery: '',

  connectWallet: async () => {
    // Simulate wallet connection delay
    await new Promise((r) => setTimeout(r, 800));
    const demoAddr = DEMO_ADDRESSES[Math.floor(Math.random() * DEMO_ADDRESSES.length)];
    set({
      wallet: {
        address: demoAddr,
        isConnected: true,
        balance: Math.floor(Math.random() * 5000) + 500,
      },
    });
  },

  disconnectWallet: () => {
    set({
      wallet: { address: null, isConnected: false, balance: 0 },
    });
  },

  openConsensusModal: (txHash: string) => {
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

  closeConsensusModal: () => {
    set({ isConsensusModalOpen: false });
  },

  updateConsensus: (update) => {
    set((s) => ({ consensus: { ...s.consensus, ...update } }));
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openCreateBetModal: () => set({ isCreateBetModalOpen: true }),
  closeCreateBetModal: () => set({ isCreateBetModalOpen: false }),
}));
