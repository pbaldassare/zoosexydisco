import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { InstagramGlyph } from "@/components/ui/icons";
import { isPlaceholder } from "@/lib/utils";

/** QR verso il profilo Instagram, generato nel browser. Senza URL mostra il segnaposto. */
export function InstagramQr({ url, handle, size = 120 }: { url: string; handle: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const ready = !!url && !isPlaceholder(handle);

  useEffect(() => {
    if (!ready) return;
    void QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#F4EDE6", light: "#00000000" } }).then(setSvg);
  }, [url, ready]);

  if (!ready) {
    return (
      <div className="grid place-items-center border border-dashed border-line text-center text-2xs text-ink-dim" style={{ width: size, height: size }}>
        <span className="flex flex-col items-center gap-2 px-2">
          <InstagramGlyph className="size-5 text-accent" aria-hidden />
          QR Instagram
          <br />[da completare]
        </span>
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener" className="inline-block" aria-label={`Instagram @${handle}`}>
      <span className="block" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg ?? "" }} />
      <span className="label mt-3 block text-2xs text-ink">@{handle}</span>
    </a>
  );
}
