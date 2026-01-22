"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Home, LayoutGrid, Store, User, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const t = useTranslations("common");

  const navItems = [
    {
      href: "/",
      label: "home",
      icon: Home,
    },
    {
      href: "/categories",
      label: "categories",
      icon: LayoutGrid,
    },
    {
      href: "/products",
      label: "shop",
      icon: Store,
    },
    {
      href: "/profile",
      label: "account",
      icon: User,
    },
    {
      href: "/cart",
      label: "cart",
      icon: ShoppingCart,
      badge: totalItems,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-secondary" : "text-gray-500 hover:text-secondary"
              }`}
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon 
                    className="w-6 h-6 transition-all duration-300" 
                  />
                </motion.div>
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {t(item.label) || item.label} 
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
