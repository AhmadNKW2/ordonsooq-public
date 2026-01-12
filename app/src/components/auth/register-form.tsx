"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Phone, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email(),
    phone: z.string().min(8, "Phone number is too short").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const t = useTranslations("auth");
  const { register: registerUser, isRegistering } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "user",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || t("error"));
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t("registerTitle")}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("haveAccount")}{" "}
          <button
            onClick={onLoginClick}
            className="font-medium text-secondary hover:text-primary2 transition"
            type="button"
          >
            {t("loginNow")}
          </button>
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
         {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("firstName")}
            </label>
            <Input
              {...register("firstName")}
              className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("lastName")}
            </label>
            <Input
              {...register("lastName")}
              className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="email"
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{t("email") + " is invalid"}</p>
          )}
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">
            {t("phone")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
              {...register("phone")}
            />
          </div>
          {errors.phone && (
               <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("password")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="password"
              className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("confirmPassword")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="password"
              className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("register")}
        </Button>
      </form>
    </div>
  );
}
