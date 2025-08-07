import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  onSort?: (key: string, order: 'ASC' | 'DESC') => void;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: Set<any>;
  onRowSelect?: (row: T, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  className?: string;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  selectedRows,
  onRowSelect,
  onSelectAll,
  rowKey = 'id' as keyof T,
  className = ''
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] ?? index;
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    if (sortBy === key) {
      onSort(key, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(key, 'ASC');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  const handleRowSelect = (row: T, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onRowSelect) {
      onRowSelect(row, e.target.checked);
    }
  };

  const isAllSelected = selectedRows && data.length > 0 && data.every(row => selectedRows.has(getRowKey(row, 0)));
  const isSomeSelected = selectedRows && selectedRows.size > 0 && !isAllSelected;

  if (loading) {
    return (
      <div className={`card overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <div className="h-4 loading-skeleton w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 loading-skeleton"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {(selectedRows || onSelectAll) && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = !!isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortBy === column.key && sortOrder === 'ASC' 
                              ? 'text-primary-600' 
                              : 'text-slate-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`h-3 w-3 -mt-1 ${
                            sortBy === column.key && sortOrder === 'DESC' 
                              ? 'text-primary-600' 
                              : 'text-slate-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, rowIndex) => {
              const key = getRowKey(row, rowIndex);
              const isSelected = selectedRows?.has(key);
              
              return (
                <tr
                  key={key}
                  className={`hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''} ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {(selectedRows || onRowSelect) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(row, e)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => {
                    const value = row[column.key as keyof T];
                    const content = column.render 
                      ? column.render(value, row, rowIndex)
                      : value?.toString() || '';
                    
                    return (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && !loading && (
        <div className="text-center py-12">
          {emptyState || (
            <div>
              <p className="text-slate-500 text-lg">No hay datos disponibles</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Table;