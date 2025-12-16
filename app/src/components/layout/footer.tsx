import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
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
import { IconButton } from "../ui/icon-button";

const FEATURES = [
  {
    title: "Free Shipping",
    description: "On orders over $50",
    Icon: Truck,
  },
  {
    title: "Secure Payment",
    description: "100% protected",
    Icon: ShieldCheck,
  },
  {
    title: "24/7 Support",
    description: "Dedicated support",
    Icon: HeadphonesIcon,
  },
  {
    title: "Easy Returns",
    description: "30-day returns",
    Icon: CreditCard,
  },
] as const;

const FOOTER_COLUMNS = [
  { title: "Shop", links: FOOTER_LINKS.shop },
  { title: "Support", links: FOOTER_LINKS.support },
  { title: "Company", links: FOOTER_LINKS.company },
] as const;

const SOCIAL_LINKS = [
  { label: "Facebook", href: SITE_CONFIG.links.facebook, Icon: Facebook },
  { label: "Twitter", href: SITE_CONFIG.links.twitter, Icon: Twitter },
  { label: "Instagram", href: SITE_CONFIG.links.instagram, Icon: Instagram },
] as const;

const PAYMENT_IMAGES = [
  { alt: "Visa", src: "/footer-icons/visa.svg" },
  { alt: "Mastercard", src: "/footer-icons/mastercard.svg" },
  { alt: "Cliq", src: "/footer-icons/cliq.svg" },
  { alt: "Apple Pay", src: "/footer-icons/apple-pay.svg" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-third2">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-none md:grid-flow-col justify-between gap-6">
            {FEATURES.map(({ title, description, Icon }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{title}</h4>
                  <p className="text-sm text-white/75">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo asLink={true} />
            </div>
            <p className="text-third2 mb-6 max-w-md">
              {SITE_CONFIG.description}
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
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
              {SOCIAL_LINKS.filter((s) => !!s.href).map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <IconButton variant="social" size="default">
                    <Icon className="w-5 h-5" />
                  </IconButton>
                </a>
              ))}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <IconButton variant="social" size="default">
                  <Youtube className="w-5 h-5" />
                </IconButton>
              </a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-third2 hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold text-lg">Subscribe to our Newsletter</h3>
              <p className="text-third2 text-sm">Get updates on new products and exclusive offers</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email..."
                className="bg-white/10 border-white/20 text-white placeholder:text-third2 focus:bg-white/20 focus:ring-white"
              />

              <Button
                type="submit"
                backgroundColor="var(--color-secondary)"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-third2">
            <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-secondary transition-colors"
                >
                  {link.label}
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
