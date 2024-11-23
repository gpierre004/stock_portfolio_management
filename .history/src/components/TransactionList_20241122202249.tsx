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
    cell: (info) => format(new Date(info.getValue()), 'MM/dd/yyyy'),
  }),
  columnHelper.accessor('ticker', {
    header: 'Ticker',
  }),
  columnHelper.accessor('type', {
    header: 'Type',
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: (info) => info.getValue().toFixed(5),
  }),
  columnHelper.accessor('purchase_price', {
    header: 'Price',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor(
    row => row.quantity * row.purchase_price,
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
        const { data } = await axios.get(url);
        return data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
        }
        throw error;
      }
    },
  });

  const table = useReactTable({
    data: transactions,
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
