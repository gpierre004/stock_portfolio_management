import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X } from 'lucide-react';
import { ENDPOINTS } from '../config/api';

interface TransactionFormProps {
  onClose: () => void;
  accountId: number | null;
}

interface TransactionFormData {
  ticker: string;
  purchase_date: string;
  quantity: number;
  type: 'BUY' | 'SELL';
  purchase_price: number;
  description?: string;
  comment?: string;
}

export default function TransactionForm({ onClose, accountId }: TransactionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      console.log('Submitting transaction with data:', { ...data, accountId });
      const response = await axios.post(ENDPOINTS.TRANSACTIONS, { ...data, accountId });
      console.log('Transaction response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Failed to create transaction');
      } else {
        alert('An unexpected error occurred');
      }
    }
  });

  const onSubmit = handleSubmit((data) => {
    if (accountId === null) {
      alert('Please select an account first');
      return;
    }
    
    // Convert string values to numbers
    const formattedData = {
      ...data,
      quantity: parseFloat(data.quantity.toString()),
      purchase_price: parseFloat(data.purchase_price.toString())
    };

    console.log('Formatted data:', formattedData);
    mutation.mutate(formattedData);
  });

  if (accountId === null) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Error</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-red-500">Please select an account first</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ticker</label>
              <input
                {...register('ticker', { required: 'Ticker is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.ticker && <span className="text-red-500 text-sm">{errors.ticker.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register('purchase_date', { required: 'Date is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.purchase_date && <span className="text-red-500 text-sm">{errors.purchase_date.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">Sell</option>
              </select>
              {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                step="0.00001"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be positive' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                {...register('purchase_price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.purchase_price && <span className="text-red-500 text-sm">{errors.purchase_price.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                {...register('comment')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {mutation.isError && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
