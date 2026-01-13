"use client";

import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service"; // Ensure updateProfile exists or user service
import { userService } from "@/services/user.service"; // checking if this exists
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

// Fallback to simple form if types/services aren't fully ready
export default function AccountDetailsPage() {
  const { user, isLoading } = useAuth();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  
  if (isLoading) {
      return <div>{tCommon('loading')}</div>;
  }
  
  // We need a way to update profile. 
  // Let's check user.service.ts if it exists in previous context or list it.
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('accountDetails')}</h1>
      <AccountForm user={user || null} t={t} />
    </div>
  );
}

function AccountForm({ user, t }: { user: User | null, t: any }) {
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('personalInfo')}</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('firstName')}</label>
                    <Input defaultValue={user.firstName} placeholder={t('firstName')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('lastName')}</label>
                    <Input defaultValue={user.lastName} placeholder={t('lastName')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('email')}</label>
                    <Input defaultValue={user.email} disabled className="bg-gray-50 text-gray-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('phone')}</label>
                    <Input defaultValue={user.phone} placeholder={t('phone')} />
                </div>

                 <div className="col-span-full pt-4">
                    <Button className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" /> {t('saveChanges')}
                    </Button>
                 </div>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('changePassword')}</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('currentPassword')}</label>
                        <Input type="password" placeholder={t('currentPassword')} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('newPassword')}</label>
                        <Input type="password" placeholder={t('newPassword')} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('confirmNewPassword')}</label>
                        <Input type="password" placeholder={t('confirmNewPassword')} />
                    </div>
                     <div className="col-span-full pt-4">
                        <Button variant="outline" className="w-full md:w-auto">
                            {t('updatePassword')}
                        </Button>
                     </div>
                </form>
            </div>
        </div>
    )
}
