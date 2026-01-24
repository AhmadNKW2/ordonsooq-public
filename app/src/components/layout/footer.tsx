import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  HeadphonesIcon
} from "lucide-react";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";
import { Logo } from "./header-components";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { IconButton, IconName } from "../ui/icon-button";
import { useTranslations } from "next-intl";

const FEATURES = [
  {
    title: "features.freeShipping",
    description: "features.freeShippingDesc",
    Icon: Truck,
  },
  {
    title: "features.securePayment",
    description: "features.securePaymentDesc",
    Icon: ShieldCheck,
  },
  {
    title: "features.support",
    description: "features.supportDesc",
    Icon: HeadphonesIcon,
  },
  {
    title: "features.easyReturns",
    description: "features.easyReturnsDesc",
    Icon: CreditCard,
  },
] as const;

const FOOTER_COLUMNS = [
  { title: "footer.links.shop", links: FOOTER_LINKS.shop },
  { title: "footer.links.support", links: FOOTER_LINKS.support },
  { title: "footer.links.company", links: FOOTER_LINKS.company },
] as const;

const SOCIAL_LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: "Facebook", href: SITE_CONFIG.links.facebook, icon: "facebook" },
  { label: "Twitter", href: SITE_CONFIG.links.twitter, icon: "twitter" },
  { label: "Instagram", href: SITE_CONFIG.links.instagram, icon: "instagram" },
];

const PAYMENT_IMAGES = [
  { alt: "Visa", src: "/footer-icons/visa.svg" },
  { alt: "Mastercard", src: "/footer-icons/mastercard.svg" },
  { alt: "Cliq", src: "/footer-icons/cliq.svg" },
  { alt: "Apple Pay", src: "/footer-icons/apple-pay.svg" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();
  const containerClass = "container mx-auto py-5 px-4 md:px-12";

  return (
    <footer className="bg-gray-900 text-third2">
      {/* Features Bar */}
      
        <div className={containerClass}>
            <div className="grid grid-cols-2 md:grid-cols-none md:grid-flow-col justify-between gap-5">
              {FEATURES.map(({ title, description, Icon }) => (
                <div key={title} className="flex items-center gap-5">
                  <div className="p-3 bg-secondary rounded-full">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{t(title)}</h4>
                    <p className="text-sm text-white/75">{t(description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Main Footer */}
        <div className={containerClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Logo asLink={true} />
              </div>
              <p className="text-third2 max-w-md mb-8">
                {t('footer.description')}
              </p>
              {/* Contact Info */}
              <div className="flex flex-col gap-3">
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="flex items-center gap-3 text-third2 hover:text-secondary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {SITE_CONFIG.contact.email}
                </a>
                <a
                  href={`tel:${SITE_CONFIG.contact.phone}`}
                  className="flex items-center gap-3 text-third2 hover:text-secondary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {SITE_CONFIG.contact.phone}
                </a>
                <div className="flex items-center gap-3 text-third2">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span>{SITE_CONFIG.contact.address}</span>
                </div>
              </div>
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {SOCIAL_LINKS.filter((s) => !!s.href).map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  >
                    <IconButton variant="social" size="default" icon={icon} />
                  </a>
                ))}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <IconButton variant="social" size="default" icon="youtube" />
                </a>
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-white font-semibold mb-4">{t(column.title)}</h3>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-third2 hover:text-secondary transition-colors"
                      >
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Newsletter */}
        <div>
          <div className={containerClass}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-30">
              <div className="">
                <h3 className="text-white font-semibold text-lg mb-1">{t('footer.subscribeTitle')}</h3>
                <p className="text-third2 text-sm">{t('footer.subscribeDesc')}</p>
              </div>
              <form className="flex gap-2 w-100">
                <Input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="bg-white/10 border-white/20 text-white placeholder:text-third2 focus:bg-white/20 focus:ring-white"
                />

                <Button
                  type="submit"
                  backgroundColor="var(--color-secondary)"
                >
                  {t('footer.subscribeButton')}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Bottom Bar */}
        <div>
          <div className={containerClass}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-third2">
              <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
              <div className="flex items-center gap-5">
                {FOOTER_LINKS.legal.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="hover:text-secondary transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                ))}
              </div>
              {/* Payment Icons */}
              <div className="flex items-center gap-3">
                {PAYMENT_IMAGES.map((icon) => (
                  <Image
                    key={icon.alt}
                    src={icon.src}
                    alt={icon.alt}
                    width={64}
                    height={32}
                    className="h-6 w-auto brightness-0 invert opacity-60"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      
    </footer>
  );
}
