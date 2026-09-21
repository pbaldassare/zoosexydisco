import { isPlaceholder } from "./utils";

/** Link WhatsApp precompilato. Senza numero apre WhatsApp e lascia scegliere il contatto. */
export function waLink(number: string, text: string) {
  const digits = isPlaceholder(number) ? "" : number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string) {
  return isPlaceholder(phone) ? undefined : `tel:${phone.replace(/[^\d+]/g, "")}`;
}
