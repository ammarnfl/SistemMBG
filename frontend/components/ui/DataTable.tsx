import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent } from './Card';

export interface Column<T> {
  header: string;
  accessorKey?: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortAccessorFn?: (row: T) => string | number | boolean | null | undefined;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  groupBy?: (row: T) => string | undefined;
  groupHeaderRender?: (group: string, rows: T[]) => React.ReactNode;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  emptyMessage?: string;
  editingRowId?: string | null;
  renderEditRow?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  groupBy,
  groupHeaderRender,
  defaultSort,
  emptyMessage = 'Tidak ada data.',
  editingRowId,
  renderEditRow,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );
  
  // By default, groups are expanded
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const toggleGroup = (group: string) => {
    const newSet = new Set(collapsedGroups);
    if (newSet.has(group)) {
      newSet.delete(group);
    } else {
      newSet.add(group);
    }
    setCollapsedGroups(newSet);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      const column = columns.find((c) => c.accessorKey === sortConfig.key);
      if (column) {
        sortableItems.sort((a, b) => {
          let aValue: any = '';
          let bValue: any = '';
          
          if (column.sortAccessorFn) {
            aValue = column.sortAccessorFn(a);
            bValue = column.sortAccessorFn(b);
          } else if (column.accessorKey) {
            aValue = (a as any)[column.accessorKey];
            bValue = (b as any)[column.accessorKey];
          }

          if (aValue === null || aValue === undefined) aValue = '';
          if (bValue === null || bValue === undefined) bValue = '';

          if (typeof aValue === 'string') aValue = aValue.toLowerCase();
          if (typeof bValue === 'string') bValue = bValue.toLowerCase();

          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
    }
    return sortableItems;
  }, [data, columns, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedData.length]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo(() => {
    if (groupBy) return sortedData; // Grouping ignores pagination for now
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, groupBy, pageSize]);

  const groupedData = useMemo(() => {
    if (!groupBy) {
      return { 'all': sortedData };
    }
    
    const groups: Record<string, T[]> = {};
    paginatedData.forEach((row) => {
      const groupName = groupBy(row) || 'Lainnya';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(row);
    });
    return groups;
  }, [paginatedData, groupBy]);

  const groupKeys = Object.keys(groupedData).sort();

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-muted/20 border rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  const renderRow = (row: T) => {
    const rowId = keyExtractor(row);
    if (editingRowId === rowId && renderEditRow) {
      return (
        <tr key={rowId} className="border-b border-border/50 bg-muted/10">
          <td colSpan={columns.length} className="p-4">
            {renderEditRow(row)}
          </td>
        </tr>
      );
    }
    return (
      <tr
        key={rowId}
        className="border-b border-border/50 hover:bg-muted/10 transition-colors duration-200"
      >
        {columns.map((col, index) => (
          <td key={index} className={`p-4 align-middle ${col.className || ''}`}>
            {col.cell ? col.cell(row) : col.accessorKey ? (row as any)[col.accessorKey] : null}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-border shadow-sm bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground bg-muted/50 border-b-2 border-border/60">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-4 font-bold whitespace-nowrap tracking-wide uppercase ${
                    col.sortable ? 'cursor-pointer hover:bg-muted/80 select-none transition-colors' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && col.accessorKey && (
                      <div className="flex flex-col">
                        {sortConfig?.key === col.accessorKey ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={14} className="text-primary" />
                          ) : (
                            <ChevronDown size={14} className="text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="text-muted-foreground/30" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!groupBy ? (
              paginatedData.map(renderRow)
            ) : (
              groupKeys.map((group) => {
                const rows = groupedData[group];
                const isCollapsed = collapsedGroups.has(group);
                return (
                  <React.Fragment key={group}>
                    <tr className="bg-secondary/10 border-b border-border/50">
                      <td colSpan={columns.length} className="p-0">
                        <button
                          className="flex items-center w-full p-3 font-medium text-left hover:bg-secondary/20 transition-colors"
                          onClick={() => toggleGroup(group)}
                        >
                          {isCollapsed ? (
                            <ChevronRight size={18} className="mr-2 text-muted-foreground" />
                          ) : (
                            <ChevronDown size={18} className="mr-2 text-muted-foreground" />
                          )}
                          {groupHeaderRender ? groupHeaderRender(group, rows) : group}
                        </button>
                      </td>
                    </tr>
                    {!isCollapsed && rows.map(renderRow)}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!groupBy && totalPages > 1 && (
        <div className="flex items-center justify-end px-6 py-4 border-t border-border/60 gap-1 bg-white">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center mr-3"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </button>
          
          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }
            return pages.map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                disabled={p === '...'}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : p === '...'
                    ? 'text-muted-foreground cursor-default'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ));
          })()}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center ml-3"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
