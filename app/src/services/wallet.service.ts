import { apiClient } from '@/lib/api-client';
import { CURRENCY_CONFIG } from '@/lib/constants';
import { 
  Wallet, 
  WalletTransaction, 
  AddFundsPayload, 
  TransactionFilterPayload,
  TransactionsResponse
} from '@/types';

function unwrapDataPayload(payload: unknown): unknown {
  let current = payload;

  while (
    current &&
    typeof current === 'object' &&
    'data' in current
  ) {
    current = (current as { data?: unknown }).data;
  }

  return current;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toId(value: unknown): string | number {
  return typeof value === 'string' || typeof value === 'number' ? value : '';
}

function normalizeWallet(payload: unknown): Wallet {
  const wallet = unwrapDataPayload(payload) as Record<string, unknown> | null;

  return {
    id: toId(wallet?.id),
    balance: toFiniteNumber(wallet?.balance),
    totalCashback: toFiniteNumber(wallet?.totalCashback),
    currency:
      typeof wallet?.currency === 'string' && wallet.currency.trim()
        ? wallet.currency
        : CURRENCY_CONFIG.code,
    userId: toId(wallet?.userId ?? wallet?.user_id),
    createdAt:
      typeof wallet?.createdAt === 'string'
        ? wallet.createdAt
        : typeof wallet?.created_at === 'string'
          ? wallet.created_at
          : undefined,
    updatedAt:
      typeof wallet?.updatedAt === 'string'
        ? wallet.updatedAt
        : typeof wallet?.updated_at === 'string'
          ? wallet.updated_at
          : undefined,
  };
}

function normalizeWalletTransaction(payload: unknown): WalletTransaction {
  const transaction = payload as Record<string, unknown> | null;

  return {
    id: toId(transaction?.id),
    amount: toFiniteNumber(transaction?.amount),
    type: transaction?.type === 'credit' ? 'credit' : 'debit',
    source: typeof transaction?.source === 'string' ? transaction.source : undefined,
    description: typeof transaction?.description === 'string' ? transaction.description : '',
    createdAt:
      typeof transaction?.createdAt === 'string'
        ? transaction.createdAt
        : typeof transaction?.created_at === 'string'
          ? transaction.created_at
          : new Date(0).toISOString(),
    balanceAfter: toFiniteNumber(transaction?.balanceAfter ?? transaction?.balance_after),
    referenceId:
      typeof transaction?.referenceId === 'string'
        ? transaction.referenceId
        : typeof transaction?.reference_id === 'string'
          ? transaction.reference_id
          : undefined,
  };
}

function normalizeWalletTransactions(payload: unknown): WalletTransaction[] {
  const transactions = unwrapDataPayload(payload);

  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions.map((transaction) => normalizeWalletTransaction(transaction));
}

export const walletService = {
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<unknown>(`/wallet`);
    return normalizeWallet(response);
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await apiClient.get<TransactionsResponse | WalletTransaction[]>(`/wallet/transactions`);
    return normalizeWalletTransactions(response);
  },

  filterTransactions: async (payload: TransactionFilterPayload): Promise<WalletTransaction[]> => {
     const response = await apiClient.post<TransactionsResponse | WalletTransaction[]>('/wallet/transactions/filter', payload);
     return normalizeWalletTransactions(response);
  },

  addFunds: async (payload: AddFundsPayload): Promise<Wallet> => {
    const response = await apiClient.post<unknown>('/wallet/add-funds', payload);
    return normalizeWallet(response);
  }
};
