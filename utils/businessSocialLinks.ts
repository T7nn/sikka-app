import { Globe, Link2, MessageCircle, type LucideIcon } from "lucide-react";
import type { BusinessRecord } from "@/types/business";

export interface BusinessSocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function buildBusinessSocialLinks(business: BusinessRecord): BusinessSocialLink[] {
  const links: BusinessSocialLink[] = [];

  if (business.instagram_url) {
    links.push({
      label: "Instagram",
      href: business.instagram_url,
      icon: Link2,
    });
  }

  if (business.whatsapp_number) {
    const digits = business.whatsapp_number.replace(/\D/g, "");
    links.push({
      label: "WhatsApp",
      href: `https://wa.me/${digits}`,
      icon: MessageCircle,
    });
  }

  if (business.website_url) {
    links.push({
      label: "Website",
      href: business.website_url,
      icon: Globe,
    });
  }

  return links;
}
