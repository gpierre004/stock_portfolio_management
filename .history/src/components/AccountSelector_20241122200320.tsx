import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Account } from '../../server/types/account';

interface AccountSelectorProps {
  selectedAccountId: number | null;
  onAccountChange: (accountId: number | null) => void;
}

export default function AccountSelector({ selectedAccountId, onAccountChange }: AccountSelectorProps) {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      // TODO: Replace with actual user ID from auth
      const userId = 1;
      const { data } = await axios.get(`http://localhost:3000/api/accounts/user/${userId}`);
      return data;
    },
  });

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
        {accounts.map((account) => (
          <option key={account.account_id} value={account.account_id}>
            {account.name} (${account.balance.toFixed(2)})
          </option>
        ))}
      </select>
    </div>
  );
}