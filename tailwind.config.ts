import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "600px", md: "860px", lg: "1100px", xl: "1400px" },
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        line: token("line"),
        ink: token("ink"),
        "ink-dim": token("ink-dim"),
        accent: token("accent"),
        "accent-hot": token("accent-hot"),
        danger: token("danger"),
        ok: token("ok"),
        sample: token("sample"),
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Didot", "serif"],
        body: ["Karla", "system-ui", "sans-serif"],
        label: ["Syne", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["12px", { lineHeight: "1.4" }],
        xs: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        lg: ["20px", { lineHeight: "1.5" }],
        xl: ["28px", { lineHeight: "1.2" }],
        "2xl": ["40px", { lineHeight: "1.08" }],
        "3xl": ["64px", { lineHeight: "1" }],
        "4xl": ["96px", { lineHeight: "0.95" }],
      },
      letterSpacing: { label: ".12em" },
      maxWidth: { prose: "65ch", site: "1320px" },
      transitionTimingFunction: { expo: "cubic-bezier(0.16, 1, 0.3, 1)" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rise: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
        unveil: {
          from: { opacity: "0", letterSpacing: "0.02em", filter: "blur(10px)" },
          to: { opacity: "1", letterSpacing: "-0.04em", filter: "blur(0)" },
        },
      },
      animation: {
        marquee: "marquee 70s linear infinite",
        rise: "rise 420ms cubic-bezier(0.16,1,0.3,1) both",
        unveil: "unveil 520ms cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
