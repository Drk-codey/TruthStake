/**
 * Format a blockchain address as truncated: 0x1234...abcd
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end + 2) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format token amounts with commas and optional decimals
 */
export function formatTokens(amount: number, symbol = 'GEN'): string {
  return `${amount.toLocaleString('en-US')} ${symbol}`;
}

/**
 * Format a Unix timestamp as a relative time string  
 */
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Truncate a URL for display
 */
export function truncateUrl(url: string, maxLen = 40): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    if (display.length <= maxLen) return display;
    return display.slice(0, maxLen) + '…';
  } catch {
    return url.length <= maxLen ? url : url.slice(0, maxLen) + '…';
  }
}

/**
 * Derive a bet's display status from its data shape
 */
export function getBetStatus(bet: { no_address: string | null; settled: boolean }): string {
  if (bet.settled) return 'settled';
  if (bet.no_address) return 'matched';
  return 'open';
}

/**
 * Animate a numeric value count-up using requestAnimationFrame
 */
export function countUp(
  from: number,
  to: number,
  duration: number,
  onUpdate: (val: number) => void,
  onComplete?: () => void
): void {
  const start = performance.now();
  const range = to - from;

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    onUpdate(Math.round(from + range * eased));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);
}
