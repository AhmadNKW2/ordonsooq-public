"use client";

import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
      <Card className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl">
        <RegisterForm 
            onSuccess={() => router.push("/")} 
            onLoginClick={() => router.push("/login")}
        />
      </Card>
  );
}
