import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Account } from '../../server/types/account';

interface AccountSelectorProps {
  selectedAccountId: number | null;
  onAccountChange: (accountId: number | null) => void;
}

export default function AccountSelector({ selectedAccountId, onAccountChange }: AccountSelectorProps) {
  const { data: accounts, error, isError, isLoading } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual user ID from auth
        const userId = 1;
        const { data } = await axios.get(`http://localhost:3000/api/accounts/user/${userId}`);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch accounts');
        }
        throw error;
      }
    },
    initialData: [], // Ensure we always have an array
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Account</label>
        <div className="w-48 h-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Account</label>
        <div className="text-red-600 text-sm">
          {error instanceof Error ? error.message : 'Failed to load accounts'}
        </div>
      </div>
    );
  }

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="account" className="text-sm font-medium text-gray-700">
        Account
      </label>
      <select
        id="account"
        value={selectedAccountId || ''}
        onChange={(e) => onAccountChange(e.target.value ? parseInt(e.target.value) : null)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">All Accounts</option>
        {safeAccounts.map((account) => (
          <option key={account.account_id} value={account.account_id}>
            {account.name} ({account.balance ? `$${account.balance.toFixed(2)}` : '$0.00'})
          </option>
        ))}
      </select>
    </div>
  );
}
