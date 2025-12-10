import { Link } from "@/i18n/navigation";
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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Free Shipping</h4>
                <p className="text-sm">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Secure Payment</h4>
                <p className="text-sm">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full">
                <HeadphonesIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">24/7 Support</h4>
                <p className="text-sm">Dedicated support</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Easy Returns</h4>
                <p className="text-sm">30-day returns</p>
              </div>
            </div>
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
            <p className="text-gray-400 mb-6 max-w-md">
              {SITE_CONFIG.description}
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-secondary transition-colors"
              >
                <Mail className="w-5 h-5" />
                {SITE_CONFIG.contact.email}
              </a>
              <a
                href={`tel:${SITE_CONFIG.contact.phone}`}
                className="flex items-center gap-3 text-gray-400 hover:text-secondary transition-colors"
              >
                <Phone className="w-5 h-5" />
                {SITE_CONFIG.contact.phone}
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>{SITE_CONFIG.contact.address}</span>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SITE_CONFIG.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <IconButton variant="social" size="default">
                  <Facebook className="w-5 h-5" />
                </IconButton>
              </a>
              <a
                href={SITE_CONFIG.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <IconButton variant="social" size="default">
                  <Twitter className="w-5 h-5" />
                </IconButton>
              </a>
              <a
                href={SITE_CONFIG.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <IconButton variant="social" size="default">
                  <Instagram className="w-5 h-5" />
                </IconButton>
              </a>
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

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold text-lg">Subscribe to our Newsletter</h3>
              <p className="text-gray-400 text-sm">Get updates on new products and exclusive offers</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:ring-white"
              />

              <Button
                type="submit"
                color="secondary"
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
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

              {/* Visa */}
              <svg className="h-13 fill-white/75" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.854 11.329l-2.003 9.367h-2.424l2.006-9.367zM26.051 17.377l1.275-3.518 0.735 3.518zM28.754 20.696h2.242l-1.956-9.367h-2.069c-0.003-0-0.007-0-0.010-0-0.459 0-0.853 0.281-1.019 0.68l-0.003 0.007-3.635 8.68h2.544l0.506-1.4h3.109zM22.429 17.638c0.010-2.473-3.419-2.609-3.395-3.714 0.008-0.336 0.327-0.694 1.027-0.785 0.13-0.013 0.28-0.021 0.432-0.021 0.711 0 1.385 0.162 1.985 0.452l-0.027-0.012 0.425-1.987c-0.673-0.261-1.452-0.413-2.266-0.416h-0.001c-2.396 0-4.081 1.275-4.096 3.098-0.015 1.348 1.203 2.099 2.122 2.549 0.945 0.459 1.262 0.754 1.257 1.163-0.006 0.63-0.752 0.906-1.45 0.917-0.032 0.001-0.071 0.001-0.109 0.001-0.871 0-1.691-0.219-2.407-0.606l0.027 0.013-0.439 2.052c0.786 0.315 1.697 0.497 2.651 0.497 0.015 0 0.030-0 0.045-0h-0.002c2.546 0 4.211-1.257 4.22-3.204zM12.391 11.329l-3.926 9.367h-2.562l-1.932-7.477c-0.037-0.364-0.26-0.668-0.57-0.82l-0.006-0.003c-0.688-0.338-1.488-0.613-2.325-0.786l-0.066-0.011 0.058-0.271h4.124c0 0 0.001 0 0.001 0 0.562 0 1.028 0.411 1.115 0.948l0.001 0.006 1.021 5.421 2.522-6.376z" />
              </svg>

              {/* Mastercard */}
              <svg className="h-12 fill-white/75" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>MasterCard</title>
                <path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z" />
              </svg>

              {/* PayPal */}
              <svg className="h-8 fill-white/75" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>PayPal</title>
                <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
              </svg>

              {/* Apple Pay */}
              <svg className="h-13 fill-white/75" viewBox="0 -150.5 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M93.5520633,27.1031049 C87.5513758,34.2039183 77.9502759,39.8045599 68.349176,39.0044683 C67.1490386,29.4033684 71.849577,19.2021998 77.3502072,12.901478 C83.3508946,5.6006416 93.8520976,0.400045829 102.353071,0 C103.353186,10.0011457 99.4527392,19.8022685 93.5520633,27.1031049 Z M102.25306,40.904686 C88.3514675,40.1045943 76.4501041,48.8055911 69.8493479,48.8055911 C63.1485803,48.8055911 53.0474231,41.3047318 42.0461628,41.5047547 C27.7445244,41.7047776 14.4430006,49.8057057 7.14216427,62.7071836 C-7.8595543,88.5101396 3.24171744,126.714516 17.7433787,147.716922 C24.8441922,158.118114 33.345166,169.51942 44.5464492,169.119374 C55.1476637,168.719328 59.3481449,162.218584 72.1496114,162.218584 C85.0510894,162.218584 88.7515133,169.119374 99.9527965,168.919351 C111.554126,168.719328 118.854962,158.51816 125.955775,148.116968 C134.056703,136.315616 137.357081,124.814299 137.557104,124.21423 C137.357081,124.014207 115.154538,115.513233 114.954515,89.9103 C114.754492,68.5078482 132.45652,58.3066795 133.256612,57.7066108 C123.255466,42.9049151 107.653679,41.3047318 102.25306,40.904686 Z M182.56226,11.9013634 L182.56226,167.819225 L206.765033,167.819225 L206.765033,114.513118 L240.268871,114.513118 C270.872377,114.513118 292.37484,93.5107124 292.37484,63.1072295 C292.37484,32.7037465 271.272423,11.9013634 241.068963,11.9013634 L182.56226,11.9013634 Z M206.765033,32.3037007 L234.668229,32.3037007 C255.670635,32.3037007 267.67201,43.5049839 267.67201,63.2072409 C267.67201,82.909498 255.670635,94.2107926 234.568218,94.2107926 L206.765033,94.2107926 L206.765033,32.3037007 Z M336.579904,169.019363 C351.781646,169.019363 365.883261,161.31848 372.283994,149.117083 L372.784052,149.117083 L372.784052,167.819225 L395.186618,167.819225 L395.186618,90.2103344 C395.186618,67.7077565 377.184556,53.2060952 349.481382,53.2060952 C323.778438,53.2060952 304.776261,67.9077794 304.076181,88.1100938 L325.878678,88.1100938 C327.678884,78.5089939 336.579904,72.2082721 348.781302,72.2082721 C363.582998,72.2082721 371.883949,79.1090626 371.883949,91.8105177 L371.883949,100.411503 L341.680488,102.211709 C313.577269,103.911904 298.375528,115.413222 298.375528,135.415513 C298.375528,155.617827 314.077326,169.019363 336.579904,169.019363 Z M343.080649,150.517243 C330.179171,150.517243 321.978231,144.316533 321.978231,134.815444 C321.978231,125.014321 329.879137,119.313668 344.980867,118.413565 L371.883949,116.713371 L371.883949,125.514379 C371.883949,140.116051 359.482528,150.517243 343.080649,150.517243 Z M425.090044,210.224083 C448.692748,210.224083 459.794019,201.223052 469.495131,173.919924 L512,54.7062671 L487.397182,54.7062671 L458.893916,146.816819 L458.393859,146.816819 L429.890594,54.7062671 L404.587695,54.7062671 L445.592392,168.219271 L443.39214,175.120061 C439.691716,186.821402 433.691029,191.321918 422.989803,191.321918 C421.089585,191.321918 417.389162,191.121895 415.88899,190.921872 L415.88899,209.624014 C417.28915,210.02406 423.289838,210.224083 425.090044,210.224083 Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
