import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceItemsHeaderProps {
  itemsCount: number;
  missingPriceCount: number;
  viewMode: 'table' | 'card';
  onChangeViewMode: (mode: 'table' | 'card') => void;
  className?: string;
}

export function InvoiceItemsHeader({
  itemsCount,
  missingPriceCount,
  viewMode,
  onChangeViewMode,
  className,
}: InvoiceItemsHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="space-y-1">
          <p className="text-base font-semibold">Items ({itemsCount})</p>
          {missingPriceCount > 0 && (
            <Badge variant="secondary" className="text-xs font-medium">
              Missing price: {missingPriceCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="icon"
            aria-label="Card view"
            onClick={() => onChangeViewMode('card')}
          >
            <Rows className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="icon"
            aria-label="Table view"
            onClick={() => onChangeViewMode('table')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
