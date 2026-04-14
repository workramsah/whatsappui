"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
  sortable?: boolean;
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  filters?: any; // optional filters prop kept flexible for pages that pass filters
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  getRowHref?: (item: T) => string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: React.ReactNode;
  itemsPerPage?: number;
}

export function DataTable<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  emptyMessage = "No data available",
  onRowClick,
  className,
  getRowHref,
  selectable = false,
  onSelectionChange,
  bulkActions,
  itemsPerPage: itemsPerPageProp = 20,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(itemsPerPageProp);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortDropdown, setSortDropdown] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const handleSort = (columnKey: string, direction: "asc" | "desc") => {
    setSortConfig({ key: columnKey, direction });
    setSortDropdown(null);
  };

  const toggleSortDropdown = (columnKey: string) => {
    setSortDropdown(sortDropdown === columnKey ? null : columnKey);
  };

  const safeData = Array.isArray(data) ? data : [];
  const sortedData = [...safeData].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    // Handle nested object properties (like tenant.name)
    if (sortConfig.key.includes(".")) {
      const keys = sortConfig.key.split(".");
      aValue = keys.reduce((obj: any, key: string) => obj?.[key], a as any);
      bValue = keys.reduce((obj: any, key: string) => obj?.[key], b as any);
    } else {
      aValue = (a as any)[sortConfig.key];
      bValue = (b as any)[sortConfig.key];
    }

    // Handle null/undefined values first
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Convert to strings for comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(safeData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? paginatedData.map((item) => item.id) : [];
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, itemId]
      : selectedIds.filter((id) => id !== itemId);
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.includes(item.id));
  const isIndeterminate =
    selectedIds.length > 0 &&
    !isAllSelected &&
    paginatedData.some((item) => selectedIds.includes(item.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);
  if (safeData.length === 0) {
    return (
      <Card className={cn("p-4 sm:p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-base sm:text-lg font-semibold">{title}</h3>}
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const value =
      typeof column.key === "string"
        ? (item as any)[column.key]
        : item[column.key as keyof T];
    return <span>{value ?? "—"}</span>;
  };

  const RowContent = ({ item }: { item: T }) => (
    <>
      {columns.map((column) => {
        const isMobileHidden = column.mobileHidden;
        return (
          <div
            key={String(column.key)}
            className={cn(
              "flex flex-col sm:table-cell",
              isMobileHidden && "hidden sm:table-cell",
              column.className,
            )}
          >
            <span className="text-xs text-muted-foreground sm:hidden mb-1">
              {column.header}
            </span>
            <div className="text-sm font-medium">
              {renderCell(item, column)}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {bulkActions && selectedIds.length > 0 && (
          <div className="flex items-center gap-2">{bulkActions}</div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              {selectable && (
                <th className="text-left py-3 px-4 w-12">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column) => {
                const isSortable = column.sortable;
                const isSorted = sortConfig?.key === column.key;
                const columnKey = String(column.key);
                return (
                  <th
                    key={columnKey}
                    className={cn(
                      "text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider relative",
                      column.className,
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {isSortable && (
                        <div className="relative">
                          <button
                            onClick={() => toggleSortDropdown(columnKey)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                          {sortDropdown === columnKey && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={() => handleSort(columnKey, "asc")}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
                                  isSorted &&
                                    sortConfig.direction === "asc" &&
                                    "bg-muted text-primary",
                                )}
                              >
                                <ChevronUp className="h-3 w-3" />
                                Sort A-Z
                              </button>
                              <button
                                onClick={() => handleSort(columnKey, "desc")}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
                                  isSorted &&
                                    sortConfig.direction === "desc" &&
                                    "bg-muted text-primary",
                                )}
                              >
                                <ChevronDown className="h-3 w-3" />
                                Sort Z-A
                              </button>
                              {isSorted && (
                                <button
                                  onClick={() => {
                                    setSortConfig(null);
                                    setSortDropdown(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted border-t border-border"
                                >
                                  Clear Sort
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => {
              const href = getRowHref?.(item);

              const cellContent = (
                <>
                  {selectable && (
                    <td className="py-3 px-4 w-12">
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.id, checked as boolean)
                        }
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("py-3 px-4 text-sm", column.className)}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </>
              );

              return (
                <tr
                  key={item.id}
                  className="border-b border-border/60 hover:bg-muted/50 transition-colors"
                >
                  {href ? (
                    <Link href={href} className="contents">
                      {cellContent}
                    </Link>
                  ) : onRowClick ? (
                    <div
                      onClick={() => onRowClick(item)}
                      className="contents cursor-pointer"
                    >
                      {cellContent}
                    </div>
                  ) : (
                    cellContent
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {paginatedData.map((item) => {
          const href = getRowHref?.(item);
          const cardContent = (
            <div className="flex items-start gap-3">
              {selectable && (
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleSelectItem(item.id, checked as boolean)
                  }
                  className="mt-1"
                />
              )}
              <div className="flex-1">
                <RowContent item={item} />
              </div>
            </div>
          );

          if (href) {
            return (
              <Link
                key={item.id}
                href={href}
                className="block p-4 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors"
              >
                {cardContent}
              </Link>
            );
          }

          if (onRowClick) {
            return (
              <div
                key={item.id}
                onClick={() => onRowClick(item)}
                className="block p-4 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {cardContent}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="block p-4 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors"
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
