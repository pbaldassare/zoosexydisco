import { isPlaceholder } from "./utils";

/**
 * Numero in formato internazionale senza «+», come lo vuole wa.me. I numeri
 * scritti all'italiana («347 587 2376») prendono il 39: senza, wa.me leggerebbe
 * «34» come prefisso della Spagna.
 */
export function waNumber(number: string) {
  const trimmed = number.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  // «39 347 …» scritto senza «+»: un cellulare italiano da solo ha 10 cifre.
  if (digits.startsWith("39") && digits.length >= 11) return digits;
  return `39${digits}`;
}

/** Link WhatsApp precompilato. Senza numero apre WhatsApp e lascia scegliere il contatto. */
export function waLink(number: string, text: string) {
  const digits = isPlaceholder(number) ? "" : waNumber(number);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string) {
  return isPlaceholder(phone) ? undefined : `tel:${phone.replace(/[^\d+]/g, "")}`;
}
