"use client";

import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();

  return (
    <PageWrapper className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <LoginForm 
            onSuccess={() => router.push("/")} 
            onRegisterClick={() => router.push("/register")}
        />
      </Card>
    </PageWrapper>
  );
}
