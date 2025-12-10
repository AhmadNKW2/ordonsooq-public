"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Send, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function Newsletter() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section className="py-16 bg-linear-to-r from-primary to-primary2 rounded-r1">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          {isSubmitted ? (
            <div className="animate-fade-in">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t('successTitle')}
              </h2>
              <p className="text-white/90">
                {t('successDesc')}
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t('title')}
              </h2>
              <p className="text-white/90 mb-8">
                {t('desc')}
              </p>
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder={t('placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
                <Button 
                  type="submit"
                  color="secondary"
                  isLoading={isLoading}
                  className="sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  {t('button')}
                </Button>
              </form>
              <p className="text-xs text-white/60 mt-4">
                {t('disclaimer')}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
