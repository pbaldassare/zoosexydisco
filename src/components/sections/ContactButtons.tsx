import { useTranslation } from "react-i18next";
import { Button, ContactDuo } from "@/components/ui/button";
import { PhoneGlyph, WhatsAppGlyph } from "@/components/ui/icons";
import { useSettings } from "@/hooks/useData";
import { telLink, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Diana e Alessia, ognuna con il suo WhatsApp e il tondo per la chiamata.
 * È l'azione primaria del sito: deve stare nella prima schermata e restare
 * a un tocco da ogni pagina (PRODUCT.md, principio 2).
 */
export function ContactButtons({ text, className, stacked = false }: { text: string; className?: string; stacked?: boolean }) {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  const contacts = s?.contacts ?? [];
  if (!contacts.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2.5", stacked ? "flex-col" : "justify-center", className)}>
      {contacts.map((c) => {
        const tel = telLink(c.phone);
        return (
          <ContactDuo key={c.name} className={stacked ? "w-full" : undefined}>
            <Button asChild className={stacked ? "flex-1" : undefined}>
              <a href={waLink(c.phone, text)} target="_blank" rel="noopener">
                <WhatsAppGlyph />
                {t("cta.waWith", { name: c.name })}
              </a>
            </Button>
            {tel && (
              <Button asChild variant="outline" size="round">
                <a href={tel} aria-label={t("cta.callWith", { name: c.name })}>
                  <PhoneGlyph />
                </a>
              </Button>
            )}
          </ContactDuo>
        );
      })}
    </div>
  );
}
