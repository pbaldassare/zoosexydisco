import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/forms/fields";

/** Campo password con l'occhio: da telefono si sbaglia facilmente a scrivere. */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={shown ? "text" : "password"} className="pr-14" {...props} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Nascondi password" : "Mostra password"}
        aria-pressed={shown}
        className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-pill text-ink-dim hover:text-pink-core"
      >
        {shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
