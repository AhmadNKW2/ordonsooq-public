"use client";

import { useWallet, useWalletTransactions } from "@/hooks/useWallet";
import { formatPrice } from "@/lib/utils";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Wallet, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations, useLocale } from "next-intl";

export default function WalletPage() {
  const { user } = useAuth();
  const t = useTranslations('profile');
  const locale = useLocale();

  const { data: wallet, isLoading: walletLoading } = useWallet({ enabled: !!user?.id });

  const { data: transactions, isLoading: historyLoading } = useWalletTransactions({ enabled: !!user?.id });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('myWallet')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-linear-to-br from-primary to-primary2 rounded-2xl p-8 text-white shadow-s1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>
          
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-2">{t('availableBalance')}</p>
            <div className="text-4xl font-bold mb-8">
              {walletLoading ? "..." : formatPrice(wallet?.balance || 0, undefined, locale)}
            </div>
          </div>
        </div>

        {/* Stats/Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center gap-6">
           <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 text-green-700">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">{t('totalCredited')}</p>
                <p className="font-bold text-lg">{formatPrice(0)}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 text-red-700">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">{t('totalSpent')}</p>
                <p className="font-bold text-lg">{formatPrice(0)}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">{t('transactionHistory')}</h2>
        </div>

        {historyLoading ? (
          <div className="p-8 text-center text-gray-500">{t('loadingHistory')}</div>
        ) : transactions && transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount, undefined, locale)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <CreditCard size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noTransactions')}</h3>
            <p className="text-gray-500">{t('noTransactionsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
