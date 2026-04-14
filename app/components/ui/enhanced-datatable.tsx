'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  filters?: any; // accept optional filters passed from pages
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  searchable?: boolean;
  onWhatsAppClick?: (item: T) => void;
}

type SortConfig<T> = {
  key: keyof T | string;
  direction: 'asc' | 'desc';
} | null;

export function EnhancedDataTable<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  emptyMessage = 'No data available',
  onRowClick,
  className,
  searchable = true,
  onWhatsAppClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  // Sorting function
  const handleSort = (key: keyof T | string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and search data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = typeof sortConfig.key === 'string' 
          ? (a as any)[sortConfig.key]
          : a[sortConfig.key as keyof T];
        const bValue = typeof sortConfig.key === 'string'
          ? (b as any)[sortConfig.key]
          : b[sortConfig.key as keyof T];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const value = typeof column.key === 'string' 
      ? (item as any)[column.key]
      : item[column.key as keyof T];
    return <span>{value ?? '—'}</span>;
  };

  const getSortIcon = (columnKey: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          {title && <h3 className="text-base sm:text-lg font-semibold">{title}</h3>}
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Showing {filteredAndSortedData.length} of {data.length} entries
          </p>
        </div>

        {/* Search */}
        {searchable && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {filteredAndSortedData.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-muted/50',
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                {onWhatsAppClick && (
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    WhatsApp
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn('py-3 px-4 text-sm', column.className)}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {onWhatsAppClick && (
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWhatsAppClick(item);
                        }}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}