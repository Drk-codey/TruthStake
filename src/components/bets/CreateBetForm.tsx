import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Globe, DollarSign, Calendar, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BetCard } from '../bets/BetCard';
import { useCreateBet } from '../../hooks/useBets';
import { useAppStore } from '../../store/appStore';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../constants';
import type { BetCategory, Bet } from '../../types';
import { format } from 'date-fns';

const CATEGORIES = ['weather', 'sports', 'politics', 'crypto', 'entertainment', 'custom'] as const;

const schema = z.object({
  question: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be under 200 characters'),
  category: z.enum(['weather', 'sports', 'politics', 'crypto', 'entertainment', 'custom']),
  settlement_url: z.string()
    .url('Please enter a valid URL starting with https://')
    .startsWith('https', 'URL must start with https://'),
  stake_amount: z.number()
    .min(1, 'Minimum stake is 1 GEN')
    .max(100_000, 'Maximum stake is 100,000 GEN'),
  expiry_hint: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const CreateBetForm: React.FC = () => {
  const { wallet, openConsensusModal, closeConsensusModal } = useAppStore();
  const createBet = useCreateBet();
  const navigate = useNavigate();
  const [stakeValue, setStakeValue] = useState(100);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      question: '',
      category: 'custom',
      settlement_url: '',
      stake_amount: 100,
      expiry_hint: '',
    },
  });

  const watchAll = watch();

  // Build a live preview Bet object
  const previewBet: Bet = {
    id: 0,
    question: watchAll.question || 'Your question will appear here...',
    yes_address: wallet.address || '0x0000...0000',
    no_address: null,
    settlement_url: watchAll.settlement_url || 'https://example.com',
    stake: watchAll.stake_amount ?? 100,
    settled: false,
    outcome: null,
    category: watchAll.category as BetCategory,
    created_at: Date.now(),
    expires_at: Date.now() + 72 * 60 * 60 * 1000,
    pot: watchAll.stake_amount ?? 100,
    evidence_urls: [],
  };

  const onSubmit = async (data: FormValues) => {
    if (!wallet.isConnected || !wallet.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    const fakeTx = '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0');
    openConsensusModal(fakeTx);

    try {
      await createBet.mutateAsync({
        ...data,
        creator: wallet.address,
      });
      closeConsensusModal();
      toast.success('Bet created successfully! 🎉');
      navigate('/explore');
    } catch {
      closeConsensusModal();
      toast.error('Failed to create bet. Please try again.');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Question */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <HelpCircle size={14} className="inline mr-1" />
              Question
            </label>
            <div className="relative">
              <textarea
                {...register('question')}
                className={`input-field min-h-[110px] ${errors.question ? 'error' : ''}`}
                placeholder="e.g. Will it rain in Abuja this Friday?"
                aria-describedby={errors.question ? 'question-error' : undefined}
              />
              <span
                className="absolute bottom-3 right-3 text-xs"
                style={{ color: watchAll.question?.length > 180 ? 'var(--no-red)' : 'var(--text-muted)' }}
              >
                {watchAll.question?.length ?? 0}/200
              </span>
            </div>
            {errors.question && (
              <p id="question-error" className="flex items-center gap-1 text-xs mt-1.5" style={{ color: 'var(--no-red)' }}>
                <AlertCircle size={12} />
                {errors.question.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Category
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => field.onChange(cat)}
                      className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: field.value === cat ? 'rgba(0,229,195,0.1)' : 'var(--bg-elevated)',
                        border: field.value === cat ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                        color: field.value === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      }}
                      aria-pressed={field.value === cat}
                      aria-label={`Category: ${CATEGORY_LABELS[cat]}`}
                    >
                      <span className="text-lg" aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Settlement URL */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Globe size={14} className="inline mr-1" />
              Settlement URL
            </label>
            <input
              {...register('settlement_url')}
              type="url"
              className={`input-field ${errors.settlement_url ? 'error' : ''}`}
              placeholder="https://weather.com/abuja"
              aria-describedby={errors.settlement_url ? 'url-error' : undefined}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              The AI will fetch this URL to determine the outcome
            </p>
            {errors.settlement_url && (
              <p id="url-error" className="flex items-center gap-1 text-xs mt-1.5" style={{ color: 'var(--no-red)' }}>
                <AlertCircle size={12} />
                {errors.settlement_url.message}
              </p>
            )}
          </div>

          {/* Stake amount */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign size={14} className="inline mr-1" />
              Stake Amount
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min={1}
                max={10000}
                step={1}
                value={stakeValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStakeValue(val);
                  setValue('stake_amount', val, { shouldValidate: true });
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${(stakeValue / 10000) * 100}%, var(--bg-elevated) ${(stakeValue / 10000) * 100}%, var(--bg-elevated) 100%)`,
                  accentColor: 'var(--accent-primary)',
                }}
                aria-label="Stake amount slider"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={stakeValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStakeValue(val);
                    setValue('stake_amount', val, { shouldValidate: true });
                  }}
                  className="input-field w-32"
                  min={1}
                  max={100000}
                  aria-label="Stake amount in GEN tokens"
                />
                <span className="text-sm font-bold" style={{ color: 'var(--stake-amber)' }}>GEN</span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                  ≈ ${(stakeValue * 0.85).toFixed(2)} USD
                </span>
              </div>
            </div>
            {errors.stake_amount && (
              <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: 'var(--no-red)' }}>
                <AlertCircle size={12} />
                {errors.stake_amount.message}
              </p>
            )}
          </div>

          {/* Expiry hint */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={14} className="inline mr-1" />
              Settlement Hint (optional)
            </label>
            <input
              {...register('expiry_hint')}
              type="text"
              className="input-field"
              placeholder="e.g. March 21, 2026 (informational only)"
            />
          </div>

          {/* Submit */}
          {!wallet.isConnected && (
            <div
              className="p-3 rounded-xl flex items-center gap-2 text-sm"
              style={{
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid rgba(245,166,35,0.2)',
                color: 'var(--stake-amber)',
              }}
            >
              <AlertCircle size={16} />
              Connect your wallet to create a bet
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isValid || !wallet.isConnected || createBet.isPending}
            loading={createBet.isPending}
            aria-label="Create bet"
          >
            {createBet.isPending ? 'Submitting to GenLayer...' : 'Create Bet'}
          </Button>
        </form>
      </motion.div>

      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="lg:sticky lg:top-24"
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Live Preview
        </p>
        <BetCard bet={previewBet} index={0} />
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          This is how your bet will appear to other users
        </p>
      </motion.div>
    </div>
  );
};
