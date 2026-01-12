"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";
import { Plus, MapPin, Trash2, Edit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AddressesPage() {
  const { user } = useAuth();
  
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressService.getAll(),
    enabled: !!user?.id,
  });
  
  const addressList = addresses || user?.addresses || [];

  if (isLoading) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary2 transition-colors">
          <Plus size={16} /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addressList.length > 0 ? (
          addressList.map((address) => (
            <div key={address.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group hover:border-primary/30 transition-colors">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <MapPin size={14} />
                     </div>
                     <span className="font-bold text-gray-900 uppercase text-sm tracking-wide">{address.type}</span>
                  </div>
                  {address.isDefault && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Default</Badge>
                  )}
               </div>
               
               <div className="space-y-1 mb-6">
                  <p className="font-bold text-gray-900">{address.firstName} {address.lastName}</p>
                  <p className="text-gray-600 text-sm">{address.address1}</p>
                  {address.address2 && <p className="text-gray-600 text-sm">{address.address2}</p>}
                  <p className="text-gray-600 text-sm">{address.city}, {address.postalCode}</p>
                  <p className="text-gray-600 text-sm">{address.country}</p>
                  <p className="text-gray-600 text-sm mt-2">{address.phone}</p>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <MapPin size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No addresses saved</h3>
            <p className="text-gray-500 mb-6">Add an address to speed up checkout.</p>
            <button className="text-primary font-medium hover:underline">
              Add your first address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
