'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
  prefix?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className,
  onClick,
  prefix,
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return `${prefix || 'Rs.'}${val.toLocaleString('en-IN')}`;
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) {
      return <TrendingUp className="h-3 w-3" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    if (trend.value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (trend.value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const variantStyles = {
    default: 'border-border/60',
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
    warning: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
    danger: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
  };

  return (
    <Card
      className={cn(
        'p-4 sm:p-5 transition-all hover:shadow-md',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </p>
        {icon && (
          <div className="text-muted-foreground flex-shrink-0">{icon}</div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-xl sm:text-2xl font-bold leading-none">
          {formatValue(value)}
        </p>
        
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>
              {trend.value > 0 ? '+' : ''}
              {trend.value.toFixed(1)}% {trend.label}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
