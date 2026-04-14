'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface PaginatedTableProps<T> {
  title: string
  subtitle?: string
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  onRowClick?: (item: T) => void
  className?: string
  searchable?: boolean
  pageSize?: number
  filters?: {
    key: keyof T | string
    label: string
    options: { value: string; label: string }[]
  }[]
}

export function PaginatedTable<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  emptyMessage = 'No data available',
  onRowClick,
  className,
  searchable = true,
  pageSize = 20,
  filters = []
}: PaginatedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = typeof key === 'string' 
            ? (item as any)[key]
            : item[key as keyof T]
          return String(itemValue) === value
        })
      }
    })

    return filtered
  }, [data, searchTerm, activeFilters])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
    setCurrentPage(1)
  }

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item)
    }
    const value = typeof column.key === 'string' 
      ? (item as any)[column.key]
      : item[column.key as keyof T]
    return <span>{value ?? '—'}</span>
  }

  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {/* Search */}
          {searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <select
                key={String(filter.key)}
                value={activeFilters[String(filter.key)] || ''}
                onChange={(e) => handleFilterChange(String(filter.key), e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        {/* Results info */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          {totalPages > 1 && (
            <span>Page {currentPage} of {totalPages}</span>
          )}
        </div>
      </div>

      {/* Table */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
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
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-border/60 hover:bg-muted/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="text-muted-foreground">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  )
}