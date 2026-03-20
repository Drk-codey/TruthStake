import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
}) => (
  <div
    className={`skeleton ${rounded ? 'rounded-full' : ''} ${className}`}
    style={{ width, height }}
    aria-hidden="true"
  />
);

export const BetCardSkeleton: React.FC = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton width={80} height={22} />
      <Skeleton width={60} height={22} />
    </div>
    <Skeleton height={18} />
    <Skeleton height={18} width="75%" />
    <Skeleton height={14} width="55%" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton height={14} width={120} />
      <Skeleton height={14} width={80} />
    </div>
    <Skeleton height={40} />
  </div>
);

export const StatBarSkeleton: React.FC = () => (
  <div className="flex gap-8 justify-center">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={100} height={14} />
      </div>
    ))}
  </div>
);
