"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addressService } from "@/services/address.service";
import { Address } from "@/types";
import { toast } from "sonner";
import { JORDAN_CITIES } from "@/lib/constants";

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    addressToEdit?: Address;
}

interface AddressFormData {
    type: 'shipping' | 'billing';
    country: string;
    city: string;
    address1: string;
    buildingNumber?: string;
    floorNumber?: string;
    phone: string;
    notes?: string;
    isDefault: boolean;
    state?: string;
}

export function AddressModal({ isOpen, onClose, addressToEdit }: AddressModalProps) {
    const t = useTranslations("profile");
    const tCommon = useTranslations("common");
    const queryClient = useQueryClient();

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<AddressFormData>({
        defaultValues: addressToEdit ? {
            ...addressToEdit,
            state: addressToEdit.state || ''
        } : {
            type: 'shipping',
            country: 'Jordan',
            isDefault: false
        }
    });

    const mutation = useMutation({
        mutationFn: (data: AddressFormData) => {
            // Ensure state is string
            const payload: Partial<Address> = {
                ...data,
                state: data.state || ''
            };

            if (addressToEdit) {
                return addressService.update(addressToEdit.id, payload);
            }
            return addressService.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success(addressToEdit ? "Address updated successfully" : "Address added successfully");
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(tCommon('error'));
        }
    });

    const onSubmit = (data: AddressFormData) => {
        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl w-full p-6 bg-white rounded-xl">
            <h2 className="text-xl font-bold mb-6">
                {addressToEdit ? t('editAddress') : t('addNewAddress')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* 1. Country (Read Only) */}
                    <Input
                        label={t('country')}
                        {...register("country", { required: "Country is required" })}
                        error={errors.country?.message}
                        defaultValue="Jordan"
                        readOnly
                        className="bg-gray-100"
                    />

                    {/* 2. City */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-primary">{t('city')}</label>
                        <Controller
                            name="city"
                            control={control}
                            rules={{ required: "City is required" }}
                            render={({ field }) => (
                                <Select
                                    options={JORDAN_CITIES}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select a city"
                                />
                            )}
                        />
                        {errors.city && (
                          <p className="text-xs text-danger">{errors.city.message}</p>
                        )}
                    </div>

                    {/* 3. Street Name / Area */}
                    <div className="col-span-2">
                        <Input
                            label={t('address1')}
                            {...register("address1", { required: "Address is required" })}
                            error={errors.address1?.message}
                            placeholder="Street name, Area, etc."
                        />
                    </div>

                    {/* 4. Building Number */}
                    <div>
                        <Input
                            label={t('buildingNumber')}
                            {...register("buildingNumber")}
                            placeholder="Building No."
                        />
                    </div>

                    {/* 5. Floor Number */}
                    <div>
                        <Input
                            label={t('floorNumber')}
                            {...register("floorNumber")}
                            placeholder="Floor No."
                        />
                    </div>

                    {/* 6. Phone Number */}
                    <div className="col-span-2">
                        <Input
                            label={t('phone')}
                            {...register("phone", { required: "Phone is required" })}
                            error={errors.phone?.message}
                            placeholder="07xxxxxxxx"
                        />
                    </div>

                    {/* 7. Notes */}
                    <div className="col-span-2">
                        <Textarea
                            label={t('notes')}
                            {...register("notes")}
                            placeholder="Any special instructions..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <input
                        type="checkbox"
                        id="isDefault"
                        {...register("isDefault")}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700 select-none">
                        {t('setDefault')}
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {tCommon('cancel')}
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {tCommon('save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
