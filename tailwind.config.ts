import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "600px", md: "860px", lg: "1060px", xl: "1400px" },
    extend: {
      colors: {
        /* il muro e le superfici */
        wall: token("wall"),
        "wall-2": token("wall-2"),
        panel: token("panel"),
        "panel-2": token("panel-2"),
        line: token("line"),

        /* inchiostri: sempre viola chiaro, mai grigio neutro */
        ink: token("ink"),
        "ink-dim": token("ink-dim"),
        "ink-faint": token("ink-faint"),

        /* i due tubi del logo. --pink e --blue li riscrive il tema attivo. */
        pink: token("pink"),
        "pink-core": token("pink-core"),
        "pink-deep": token("pink-deep"),
        blue: token("blue"),
        "blue-core": token("blue-core"),
        "blue-deep": token("blue-deep"),

        /* semantici */
        ok: token("ok"),
        danger: token("danger"),
        sample: token("sample"),

        /* Alias del sistema precedente: le pagine non ancora riportate al neon
         * continuano a funzionare e prendono la nuova palette senza modifiche. */
        bg: token("wall"),
        surface: token("panel"),
        "surface-2": token("panel-2"),
        accent: token("pink"),
        "accent-hot": token("blue"),
      },
      fontFamily: {
        /* il tubo: solo titoli, nomi delle serate, voci del menu mobile */
        neon: ['"Tilt Neon"', '"Arial Rounded MT Bold"', '"Helvetica Neue"', "sans-serif"],
        /* tutto il testo di lettura, pulsanti, etichette */
        body: ['"Atkinson Hyperlegible"', '"Helvetica Neue"', "Arial", "sans-serif"],
        /* solo orari e date numeriche */
        mono: ['"Chivo Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"],
        display: ['"Tilt Neon"', '"Arial Rounded MT Bold"', "sans-serif"],
        label: ['"Atkinson Hyperlegible"', '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      fontSize: {
        "2xs": ["13px", { lineHeight: "1.4" }],
        xs: ["14px", { lineHeight: "1.5" }],
        base: ["17px", { lineHeight: "1.6" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["clamp(26px, 3.6vw, 34px)", { lineHeight: "1.1" }],
        "2xl": ["clamp(34px, 5vw, 48px)", { lineHeight: "1.05" }],
        "3xl": ["clamp(40px, 7.4vw, 76px)", { lineHeight: "1.02" }],
        "4xl": ["clamp(46px, 8vw, 84px)", { lineHeight: "1" }],
      },
      letterSpacing: { label: ".06em" },
      borderRadius: { pill: "999px", panel: "22px", card: "26px", band: "30px", tile: "18px" },
      maxWidth: { prose: "60ch", site: "1180px" },
      spacing: { gutter: "clamp(18px, 4vw, 40px)", section: "clamp(76px, 11vw, 128px)" },
      transitionTimingFunction: { expo: "cubic-bezier(0.16, 1, 0.3, 1)" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rise: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
        /* il tubo che scatta una volta sola quando entra in vista */
        strike: {
          "0%": { opacity: "0.35" },
          "8%": { opacity: "1" },
          "12%": { opacity: "0.4" },
          "20%": { opacity: "1" },
          "24%": { opacity: "0.55" },
          "34%": { opacity: "1" },
          "100%": { opacity: "1" },
        },
        /* il ronzio del neon acceso, appena percettibile */
        hum: {
          "0%,100%": { opacity: "1" },
          "47%": { opacity: "1" },
          "48%": { opacity: "0.82" },
          "49%": { opacity: "1" },
          "72%": { opacity: "0.94" },
        },
        /* l'insegna che si accende all'avvio */
        ignite: {
          "0%": { filter: "brightness(.35) saturate(.6)" },
          "6%": { filter: "brightness(1.05)" },
          "10%": { filter: "brightness(.4) saturate(.7)" },
          "18%": { filter: "brightness(1.1)" },
          "22%": { filter: "brightness(.55)" },
          "30%,100%": { filter: "brightness(1) saturate(1.1)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        rise: "rise 420ms cubic-bezier(0.16,1,0.3,1) both",
        strike: "strike 1.3s steps(1,end) both",
        hum: "hum 7s ease-in-out infinite",
        ignite: "ignite 1.6s steps(1,end) both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
