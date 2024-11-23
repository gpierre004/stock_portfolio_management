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
import { format } from 'date-fns';

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
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: async () => {
      const url = accountId 
        ? `http://localhost:3000/api/transactions?accountId=${accountId}`
        : 'http://localhost:3000/api/transactions';
      const { data } = await axios.get(url);
      return data;
    },
  });

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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