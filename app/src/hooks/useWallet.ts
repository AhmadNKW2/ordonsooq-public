import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet.service';
import type { AddFundsPayload, TransactionFilterPayload } from '@/types';

export const WALLET_QUERY_KEYS = {
  all: ['wallet'] as const,
  details: () => [...WALLET_QUERY_KEYS.all, 'details'] as const,
  transactions: () => [...WALLET_QUERY_KEYS.all, 'transactions'] as const,
  filteredTransactions: (filters: TransactionFilterPayload) => [...WALLET_QUERY_KEYS.transactions(), filters] as const,
};

/**
 * Hook to fetch wallet details
 */
export function useWallet() {
  return useQuery({
    queryKey: WALLET_QUERY_KEYS.details(),
    queryFn: () => walletService.getWallet(),
  });
}

/**
 * Hook to fetch wallet transactions
 */
export function useWalletTransactions() {
  return useQuery({
    queryKey: WALLET_QUERY_KEYS.transactions(),
    queryFn: () => walletService.getTransactions(),
  });
}

/**
 * Hook to filter wallet transactions
 */
export function useFilterTransactions(filters: TransactionFilterPayload) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.filteredTransactions(filters),
        queryFn: () => walletService.filterTransactions(filters),
        // Helper to not run if no filters or different triggering logic could be added
    });
}

/**
 * Hook to add funds to wallet
 */
export function useAddFunds() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AddFundsPayload) => walletService.addFunds(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.details() });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions() });
    },
  });
}
