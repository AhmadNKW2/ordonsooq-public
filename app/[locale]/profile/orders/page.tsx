"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/useAuth";

export default function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => orderService.getAll(),
    enabled: !!user?.id,
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex w-full sm:w-auto gap-2">
           <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input placeholder="Search orders..." className="pl-9" />
           </div>
           <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
             <Filter className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : orders && orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                      <Package size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          Order #{typeof order.id === 'string' && order.id.includes('-') ? order.id.split('-')[0] : order.id}
                        </h3>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                      <div className="text-sm text-gray-600">
                        {order.items.length} items • Total: <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                     <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition-colors w-full md:w-auto">
                       View Details
                     </button>
                     {order.status === 'delivered' && (
                       <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary2 transition-colors w-full md:w-auto">
                         Buy Again
                       </button>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Package size={40} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">Looks like you haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
