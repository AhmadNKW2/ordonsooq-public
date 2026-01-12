"use client";

import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <PageWrapper className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl">
        <RegisterForm 
            onSuccess={() => router.push("/")} 
            onLoginClick={() => router.push("/login")}
        />
      </Card>
    </PageWrapper>
  );
}
