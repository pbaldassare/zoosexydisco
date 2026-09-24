import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { InstagramGlyph } from "@/components/ui/icons";
import { isPlaceholder } from "@/lib/utils";

/**
 * QR verso il profilo Instagram, disegnato nel browser: finché nessuno lo
 * inquadra, il sito non parla con Instagram.
 *
 * Moduli scuri su cartoncino chiaro, con il bordo bianco attorno. Non è una
 * scelta estetica: un QR chiaro su fondo scuro e senza margine molte
 * fotocamere non lo leggono, e un QR che non si legge non serve a niente.
 */
export function InstagramQr({ url, handle, size = 120 }: { url: string; handle: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const ready = !!url && !isPlaceholder(handle);

  useEffect(() => {
    if (!ready) return;
    // margin 0: la zona di rispetto la dà il padding del cartoncino.
    void QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#07040A", light: "#00000000" } }).then(setSvg);
  }, [url, ready]);

  if (!ready) {
    return (
      <div className="grid place-items-center rounded-tile border border-dashed border-line text-center text-xs text-ink-dim" style={{ width: size, height: size }}>
        <span className="flex flex-col items-center gap-2 px-2">
          <InstagramGlyph className="size-5 text-pink" aria-hidden />
          QR Instagram
          <br />
          [da completare]
        </span>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener" className="inline-block no-underline" aria-label={`Instagram @${handle}`}>
      <span className="block rounded-tile bg-ink p-[9%]" style={{ width: size, height: size }}>
        <span className="block h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg ?? "" }} />
      </span>
      <span className="label mt-3 block text-ink">@{handle}</span>
    </a>
  );
}
