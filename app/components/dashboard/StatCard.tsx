'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  progress,
  trend,
  icon,
  className,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  return (
    <Card className={cn('p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </p>
        {icon && (
          <div className="text-muted-foreground flex-shrink-0">{icon}</div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-xl sm:text-2xl font-bold leading-none">
          {formatValue(value)}
        </p>
        
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
        
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
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
