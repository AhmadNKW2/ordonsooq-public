import { apiClient } from '@/lib/api-client';
import { 
  Wallet, 
  WalletTransaction, 
  AddFundsPayload, 
  TransactionFilterPayload,
  TransactionsResponse
} from '@/types';

export const walletService = {
  getWallet: async (): Promise<Wallet> => {
    return apiClient.get<Wallet>(`/wallet`);
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await apiClient.get<TransactionsResponse | WalletTransaction[]>(`/wallet/transactions`);
    if ('data' in response && Array.isArray(response.data)) {
        return response.data;
    }
    return response as WalletTransaction[];
  },

  filterTransactions: async (payload: TransactionFilterPayload): Promise<WalletTransaction[]> => {
     const response = await apiClient.post<TransactionsResponse | WalletTransaction[]>('/wallet/transactions/filter', payload);
     if ('data' in response && Array.isArray(response.data)) {
        return response.data;
     }
     return response as WalletTransaction[];
  },

  addFunds: async (payload: AddFundsPayload): Promise<Wallet> => {
    return apiClient.post<Wallet>('/wallet/add-funds', payload);
  }
};
