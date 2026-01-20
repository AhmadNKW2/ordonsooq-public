"use client";

import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();

  return (
      <Card className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <LoginForm 
            onSuccess={() => router.push("/")} 
            onRegisterClick={() => router.push("/register")}
        />
      </Card>
  );
}
