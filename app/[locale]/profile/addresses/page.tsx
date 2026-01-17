"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";
import { Plus, MapPin, Trash2, Edit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { AddressModal } from "@/components/profile/address-modal";
import { Address } from "@/types";
import { toast } from "sonner";

export default function AddressesPage() {
  const { user } = useAuth();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressService.getAll(),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: addressService.delete,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        toast.success("Address deleted successfully");
    },
    onError: () => {
        toast.error(tCommon('error'));
    }
  });

  const handleAdd = () => {
    setEditingAddress(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
        deleteMutation.mutate(id);
    }
  };
  
  const addressList = addresses || user?.addresses || [];

  if (isLoading) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('myAddresses')}</h1>
        <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary2 transition-colors"
        >
          <Plus size={16} /> {t('addNewAddress')}
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
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{t('default')}</Badge>
                  )}
               </div>
               
               <div className="space-y-1 mb-6">
                  <p className="font-bold text-gray-900">{address.city}, {address.country}</p>
                  <p className="text-gray-600 text-sm">{address.address1}</p>
                  {address.buildingNumber && <p className="text-gray-600 text-sm">{t('buildingNumber')}: {address.buildingNumber}</p>}
                  {address.floorNumber && <p className="text-gray-600 text-sm">{t('floorNumber')}: {address.floorNumber}</p>}
                  {address.notes && <p className="text-gray-500 text-xs mt-1 italic">{address.notes}</p>}
                  <p className="text-gray-600 text-sm mt-2">{address.phone}</p>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} /> {tCommon('edit')}
                  </button>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> {tCommon('delete')}
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <MapPin size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noAddresses')}</h3>
            <p className="text-gray-500 mb-6">{t('addAddressDesc')}</p>
            <button onClick={handleAdd} className="text-primary font-medium hover:underline">
              {t('addFirstAddress')}
            </button>
          </div>
        )}
      </div>

      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        addressToEdit={editingAddress}
      />
    </div>
  );
}
