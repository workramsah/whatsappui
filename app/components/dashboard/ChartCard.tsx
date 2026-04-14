'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) {
  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </Card>
  );
}
