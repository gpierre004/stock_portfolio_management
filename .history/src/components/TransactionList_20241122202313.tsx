import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

interface Transaction {
  purchase_id: number;
  ticker: string;
  purchase_date: string;
  quantity: number;
  type: string;
  purchase_price: number;
  description?: string;
  comment?: string;
  account_id?: number;
}

interface TransactionListProps {
  accountId: number | null;
}

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor('purchase_date', {
    header: 'Date',
    cell: (info) => {
      try {
        const dateValue = info.getValue();
        if (!dateValue) return 'N/A';
        return format(parseISO(dateValue), 'MM/dd/yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    },
  }),
  columnHelper.accessor('ticker', {
    header: 'Ticker',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: (info) => {
      const value = info.getValue();
      return typeof value === 'number' ? value.toFixed(5) : '0.00000';
    },
  }),
  columnHelper.accessor('purchase_price', {
    header: 'Price',
    cell: (info) => {
      const value = info.getValue();
      return typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00';
    },
  }),
  columnHelper.accessor(
    row => {
      const quantity = typeof row.quantity === 'number' ? row.quantity : 0;
      const price = typeof row.purchase_price === 'number' ? row.purchase_price : 0;
      return quantity * price;
    },
    {
      id: 'total',
      header: 'Total',
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }
  ),
];

export default function TransactionList({ accountId }: TransactionListProps) {
  const { data: transactions = [], error, isError, isLoading } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: async () => {
      try {
        const url = accountId 
          ? `http://localhost:3000/api/transactions?accountId=${accountId}`
          : 'http://localhost:3000/api/transactions';
        const { data } = await axios.get<Transaction[]>(url);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
        }
        throw error;
      }
    },
    initialData: [], // Ensure we always have an array
  });

  const table = useReactTable({
    data: Array.isArray(transactions) ? transactions : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          {error instanceof Error ? error.message : 'An error occurred while fetching transactions'}
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-center">
          No transactions found. Add a transaction to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
