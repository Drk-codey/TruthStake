import React from 'react';
import type { BetCategory } from '../../types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'open' | 'matched' | 'settling' | 'settled' | 'category' | 'yes' | 'no';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variantClass = {
    default: 'badge-category',
    open: 'badge-open',
    matched: 'badge-matched',
    settling: 'badge-settling',
    settled: 'badge-settled',
    category: 'badge-category',
    yes: 'bg-[rgba(34,211,122,0.12)] text-[#22D37A] border border-[rgba(34,211,122,0.25)]',
    no: 'bg-[rgba(240,92,92,0.12)] text-[#F05C5C] border border-[rgba(240,92,92,0.25)]',
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className ?? ''}`}>
      {children}
    </span>
  );
};

interface CategoryBadgeProps {
  category: BetCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => (
  <Badge variant="category" className={className}>
    <span aria-hidden="true">{CATEGORY_ICONS[category] ?? '🎯'}</span>
    {CATEGORY_LABELS[category] ?? category}
  </Badge>
);
