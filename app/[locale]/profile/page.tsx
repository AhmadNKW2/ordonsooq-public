"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { walletService } from "@/services/wallet.service";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";
import { 
  Package, 
  CreditCard, 
  MapPin, 
  ChevronRight,
  User,
  Heart
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";

export default function ProfilePage() {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => orderService.getAll(),
    enabled: !!user?.id,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => walletService.getWallet(),
    enabled: !!user?.id,
  });

  const recentOrders = orders?.slice(0, 3) || [];
  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-danger/10 text-danger border-danger/20";
      case "processing": return "bg-secondary/10 text-secondary border-secondary/20";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Summary */}
        <div className="bg-linear-to-br from-primary to-primary2 rounded-xl p-6 text-white shadow-s1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={80} />
          </div>
          <p className="text-blue-100 mb-1 font-medium">Wallet Balance</p>
          <div className="text-3xl font-bold mb-4">
             {walletLoading ? "..." : formatPrice(wallet?.balance || 0)}
          </div>
          <Link href="/profile/wallet" className="inline-flex items-center text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
            Top up Wallet <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Orders Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group hover:border-secondary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
               <p className="text-gray-500 mb-1 font-medium">Total Orders</p>
               <div className="text-3xl font-bold text-gray-900 mb-1">
                 {ordersLoading ? "..." : orders?.length || 0}
               </div>
               <p className="text-xs text-gray-400">Lifetime orders</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Package size={20} />
            </div>
          </div>
          <Link href="/profile/orders" className="absolute bottom-6 text-sm text-secondary font-medium hover:underline inline-flex items-center">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Wishlist Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group hover:border-danger/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
               <p className="text-gray-500 mb-1 font-medium">Wishlist</p>
               <div className="text-3xl font-bold text-gray-900 mb-1">
                 {wishlistItems.length}
               </div>
               <p className="text-xs text-gray-400">Saved items</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <Heart size={20} />
            </div>
          </div>
          <Link href="/profile/wishlist" className="absolute bottom-6 text-sm text-danger font-medium hover:underline inline-flex items-center">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Address Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative hover:border-secondary/30 transition-colors">
          <div className="flex items-start justify-between mb-4">
             <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
               <MapPin size={20} />
             </div>
             <Link href="/profile/addresses" className="text-sm text-gray-400 hover:text-primary">Edit</Link>
          </div>
          <p className="text-gray-500 font-medium mb-1">Default Address</p>
          {defaultAddress ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900">{defaultAddress.firstName} {defaultAddress.lastName}</p>
              <p className="line-clamp-2">{defaultAddress.address1}, {defaultAddress.city}</p>
            </div>
          ) : (
             <p className="text-sm text-gray-400 italic">No default address set</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900">Recent Orders</h2>
          <Link href="/profile/orders" className="text-sm text-secondary font-medium hover:underline">View All</Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                     <Package size={24} />
                   </div>
                   <div>
                     <p className="font-medium text-gray-900">Order #{typeof order.id === 'string' && order.id.includes('-') ? order.id.split('-')[0] : order.id}</p>
                     <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                
                <div className="hidden sm:block text-right">
                  <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs text-gray-400">{order.items.length} Items</p>
                </div>
                
                <Badge className={getStatusColor(order.status)} variant="outline">
                   {order.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
