"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { 
  User, 
  Package, 
  CreditCard, 
  MapPin, 
  LogOut, 
  LayoutDashboard,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { key: "dashboard", href: "/profile", icon: LayoutDashboard },
  { key: "myOrders", href: "/profile/orders", icon: Package },
  { key: "myWallet", href: "/profile/wallet", icon: CreditCard },
  { key: "wishlist", href: "/profile/wishlist", icon: Heart },
  { key: "addresses", href: "/profile/addresses", icon: MapPin },
  { key: "accountDetails", href: "/profile/account", icon: User },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const tProfile = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("nav");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {user?.firstName?.[0] || "U"}
          </div>
          <div>
            <p className="font-medium text-gray-900">{tProfile("hello")}</p>
            <h3 className="font-bold text-lg text-primary">{user?.firstName} {user?.lastName}</h3>
          </div>
        </div>
      </div>
      
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          const label =
            item.key === "dashboard" ? tProfile("dashboard") :
            item.key === "accountDetails" ? tProfile("accountDetails") :
            item.key === "addresses" ? tProfile("addresses") :
            item.key === "myOrders" ? tProfile("myOrders") :
            item.key === "myWallet" ? tProfile("myWallet") :
            item.key === "wishlist" ? tProfile("wishlist") :
            item.key;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
              {label}
            </Link>
          );
        })}
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors mt-4"
        >
          <LogOut className="h-5 w-5" />
          {tAuth("logout")}
        </button>
      </nav>
    </div>
  );
}
