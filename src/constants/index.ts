export const NETWORK = (import.meta.env.VITE_NETWORK ?? 'localnet') as 'localnet' | 'testnet';
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const PRIVATE_KEY = (import.meta.env.VITE_PRIVATE_KEY ?? '0x0000000000000000000000000000000000000000000000000000000000000001') as `0x${string}`;

export const POLL_INTERVAL_MS = 15_000;

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  weather: 'Weather',
  sports: 'Sports',
  politics: 'Politics',
  crypto: 'Crypto',
  entertainment: 'Entertainment',
  custom: 'Custom',
};

export const CATEGORY_ICONS: Record<string, string> = {
  weather: '🌤️',
  sports: '⚽',
  politics: '🏛️',
  crypto: '₿',
  entertainment: '🎬',
  custom: '🎯',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest-stake', label: 'Highest Stake' },
  { value: 'soonest-expiry', label: 'Soonest Expiry' },
  { value: 'most-matched', label: 'Most Matched' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'matched', label: 'Matched' },
  { value: 'settled', label: 'Settled' },
] as const;

/** Mock stats for demo purposes — replace with on-chain reads */
export const MOCK_STATS = {
  totalBets: 1847,
  totalStaked: 284_500,
  betsSettled: 1203,
  successRate: 99.8,
};

/** Mock bets seeded for demo UI */
export const MOCK_BETS = [
  {
    id: 1,
    question: 'Will it rain in Abuja this Friday?',
    yes_address: '0x3f4a8b2c1d9e0f5a7b6c3d8e4f1a2b3c4d5e6f7a',
    no_address: null,
    settlement_url: 'https://weather.com/abuja',
    stake: 100,
    settled: false,
    outcome: null,
    created_at: Date.now() - 3600_000,
    category: 'weather',
  },
  {
    id: 2,
    question: 'Will Nigeria win AFCON 2026?',
    yes_address: '0xabc123def456abc123def456abc123def456abc1',
    no_address: '0x789xyz987xyz789xyz987xyz789xyz987xyz789x',
    settlement_url: 'https://bbc.com/sport/football/afcon',
    stake: 500,
    settled: false,
    outcome: null,
    created_at: Date.now() - 7200_000,
    category: 'sports',
  },
  {
    id: 3,
    question: 'Will Bitcoin hit $120k before April 2026?',
    yes_address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    no_address: '0xcafebabecafebabecafebabecafebabecafebabe',
    settlement_url: 'https://coinmarketcap.com/currencies/bitcoin',
    stake: 1000,
    settled: true,
    outcome: 'YES',
    created_at: Date.now() - 86400_000,
    category: 'crypto',
  },
  {
    id: 4,
    question: 'Will AI replace 50% of software jobs by 2027?',
    yes_address: '0x1111111111111111111111111111111111111111',
    no_address: null,
    settlement_url: 'https://reports.weforum.org/future-of-jobs',
    stake: 250,
    settled: false,
    outcome: null,
    created_at: Date.now() - 1800_000,
    category: 'custom',
  },
  {
    id: 5,
    question: 'Will Squid Game Season 3 be released in 2025?',
    yes_address: '0x2222222222222222222222222222222222222222',
    no_address: '0x3333333333333333333333333333333333333333',
    settlement_url: 'https://en.wikipedia.org/wiki/Squid_Game',
    stake: 50,
    settled: true,
    outcome: 'NO',
    created_at: Date.now() - 172800_000,
    category: 'entertainment',
  },
  {
    id: 6,
    question: 'Will the US Federal Reserve cut rates in Q2 2026?',
    yes_address: '0x4444444444444444444444444444444444444444',
    no_address: null,
    settlement_url: 'https://federalreserve.gov/monetarypolicy',
    stake: 750,
    settled: false,
    outcome: null,
    created_at: Date.now() - 900_000,
    category: 'politics',
  },
] as const;
