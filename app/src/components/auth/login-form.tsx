"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const t = useTranslations("auth");
  const { login, isLoggingIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || t("error"));
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t("loginTitle")}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("noAccount")}{" "}
          <button
            onClick={onRegisterClick}
            className="font-medium text-secondary hover:text-primary2 transition"
            type="button"
          >
            {t("registerNow")}
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
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder={t("email")}
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{t("email") + " is invalid"}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t("password")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("password")}
              className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-medium text-secondary hover:text-primary2 transition"
          >
            {t("forgotPassword")}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("login")}
        </Button>
      </form>
    </div>
  );
}
