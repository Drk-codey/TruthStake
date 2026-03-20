import React, { useState } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, Check, Zap } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { truncateAddress, formatTokens } from '../../lib/formatters';
import { Button } from '../ui/Button';

export const WalletBadge: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connectWallet();
    setIsConnecting(false);
  };

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet.isConnected) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleConnect}
        loading={isConnecting}
        icon={<Wallet size={16} />}
        aria-label="Connect wallet"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all group"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
        }}
        aria-label="Wallet menu"
        aria-expanded={isOpen}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: 'rgba(0,229,195,0.15)' }}
        >
          <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
        </span>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {truncateAddress(wallet.address!, 6, 4)}
          </span>
          <span className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent-primary)' }}>
            {formatTokens(wallet.balance)}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-60 rounded-xl p-3 z-50 animate-scale-in"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-glass)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-2 py-1 mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Connected Account
              </p>
              <p className="text-sm font-mono break-all" style={{ color: 'var(--text-secondary)' }}>
                {wallet.address}
              </p>
            </div>

            <div
              className="px-2 py-2 rounded-lg mb-2 flex items-center justify-between"
              style={{ background: 'rgba(0,229,195,0.07)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Balance</span>
              <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                {formatTokens(wallet.balance)}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--yes-green)' }} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>

            <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />

            <button
              onClick={() => { disconnectWallet(); setIsOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10"
              style={{ color: 'var(--no-red)' }}
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};
