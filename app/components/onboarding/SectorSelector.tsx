'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Sector {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const BUSINESS_SECTORS: Sector[] = [
  { id: 'retail', label: 'Retail', description: 'Physical or online store' },
  { id: 'wholesale', label: 'Wholesale', description: 'B2B distribution' },
  { id: 'restaurant', label: 'Restaurant & Food', description: 'Food service business' },
  { id: 'grocery', label: 'Grocery Store', description: 'Food & daily essentials' },
  { id: 'pharmacy', label: 'Pharmacy', description: 'Medical supplies & medicines' },
  { id: 'textiles', label: 'Textiles & Apparel', description: 'Clothing & fabrics' },
  { id: 'electronics', label: 'Electronics', description: 'Gadgets & devices' },
  { id: 'hardware', label: 'Hardware Store', description: 'Tools & building materials' },
  { id: 'stationery', label: 'Stationery', description: 'Office & school supplies' },
  { id: 'freelancer', label: 'Freelancer', description: 'Service provider' },
  { id: 'typing-center', label: 'Typing Center', description: 'Document services' },
  { id: 'other', label: 'Other', description: 'Other business type' },
];

interface SectorSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function SectorSelector({
  selected,
  onChange,
  className,
}: SectorSelectorProps) {
  const toggleSector = (sectorId: string) => {
    if (selected.includes(sectorId)) {
      onChange(selected.filter((id) => id !== sectorId));
    } else {
      onChange([...selected, sectorId]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <label className="text-sm font-medium mb-2 block">
          Business Sector <span className="text-muted-foreground">(Select all that apply)</span>
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Help us personalize your experience by selecting your business type
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUSINESS_SECTORS.map((sector) => {
          const isSelected = selected.includes(sector.id);
          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => toggleSector(sector.id)}
              className={cn(
                'relative p-4 rounded-lg border-2 text-left transition-all',
                'hover:border-primary/50 hover:bg-muted/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {sector.icon}
                    <span className="font-medium text-sm">{sector.label}</span>
                  </div>
                  {sector.description && (
                    <p className="text-xs text-muted-foreground">
                      {sector.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} sector{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
