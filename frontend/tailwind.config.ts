import type { Config } from 'tailwindcss';

// ── Michu Pharmacy · Brand Palette ──────────────────────────────────────────
//    Primary  (Leaf Green)  : #29710A
//    Surface  (Soft Mint)   : #E4EBDF
//    Accent   (Juicy Orange): #F57C00
//    Accent 2 (Warm Amber)  : #FFB300
// ────────────────────────────────────────────────────────────────────────────

const primaryScale = {
  50:      'rgb(var(--primary-50-rgb) / <alpha-value>)',
  100:     'rgb(var(--primary-100-rgb) / <alpha-value>)',
  200:     'rgb(var(--primary-200-rgb) / <alpha-value>)',
  300:     'rgb(var(--primary-300-rgb) / <alpha-value>)',
  400:     'rgb(var(--primary-400-rgb) / <alpha-value>)',
  500:     'rgb(var(--primary-500-rgb) / <alpha-value>)',
  600:     'rgb(var(--primary-600-rgb) / <alpha-value>)',
  700:     'rgb(var(--primary-700-rgb) / <alpha-value>)',
  800:     'rgb(var(--primary-800-rgb) / <alpha-value>)',
  900:     'rgb(var(--primary-900-rgb) / <alpha-value>)',
  950:     'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--primary-500-rgb) / <alpha-value>)',
};

const surfaceScale = {
  50:      'rgb(var(--bg-50-rgb) / <alpha-value>)',
  100:     'rgb(var(--bg-100-rgb) / <alpha-value>)',
  200:     'rgb(var(--bg-200-rgb) / <alpha-value>)',
  300:     'rgb(var(--bg-300-rgb) / <alpha-value>)',
  400:     'rgb(var(--bg-400-rgb) / <alpha-value>)',
  500:     'rgb(var(--bg-500-rgb) / <alpha-value>)',
  600:     'rgb(var(--bg-600-rgb) / <alpha-value>)',
  700:     'rgb(var(--bg-700-rgb) / <alpha-value>)',
  800:     'rgb(var(--bg-800-rgb) / <alpha-value>)',
  900:     'rgb(var(--bg-900-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--bg-200-rgb) / <alpha-value>)',
};

const darkScale = {
  50:      'rgb(var(--primary-50-rgb) / <alpha-value>)',
  100:     'rgb(var(--primary-100-rgb) / <alpha-value>)',
  200:     'rgb(var(--primary-200-rgb) / <alpha-value>)',
  300:     'rgb(var(--primary-300-rgb) / <alpha-value>)',
  400:     'rgb(var(--primary-400-rgb) / <alpha-value>)',
  500:     'rgb(var(--primary-600-rgb) / <alpha-value>)',
  600:     'rgb(var(--primary-700-rgb) / <alpha-value>)',
  700:     'rgb(var(--primary-800-rgb) / <alpha-value>)',
  800:     'rgb(var(--primary-900-rgb) / <alpha-value>)',
  900:     'rgb(var(--primary-950-rgb) / <alpha-value>)',
  950:     'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
};

const neutralScale = {
  50:      'rgb(var(--bg-50-rgb) / <alpha-value>)',
  100:     'rgb(var(--bg-100-rgb) / <alpha-value>)',
  200:     'rgb(var(--bg-200-rgb) / <alpha-value>)',
  300:     'rgb(var(--border-rgb) / <alpha-value>)',
  400:     'rgb(var(--text-muted-rgb) / <alpha-value>)',
  500:     'rgb(var(--text-muted-rgb) / <alpha-value>)',
  600:     'rgb(var(--text-body-rgb) / <alpha-value>)',
  700:     'rgb(var(--primary-700-rgb) / <alpha-value>)',
  800:     'rgb(var(--primary-800-rgb) / <alpha-value>)',
  900:     'rgb(var(--text-dark-rgb) / <alpha-value>)',
  950:     'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
};

// ── Juicy Orange accent scale ────────────────────────────────────────────────
const accentScale = {
  50:      'rgb(var(--accent-50-rgb) / <alpha-value>)',
  100:     'rgb(var(--accent-100-rgb) / <alpha-value>)',
  200:     'rgb(var(--accent-200-rgb) / <alpha-value>)',
  300:     'rgb(var(--accent-300-rgb) / <alpha-value>)',
  400:     'rgb(var(--accent-400-rgb) / <alpha-value>)',
  500:     'rgb(var(--accent-500-rgb) / <alpha-value>)',
  600:     'rgb(var(--accent-600-rgb) / <alpha-value>)',
  700:     'rgb(var(--accent-700-rgb) / <alpha-value>)',
  800:     'rgb(var(--accent-800-rgb) / <alpha-value>)',
  900:     'rgb(var(--accent-900-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--accent-500-rgb) / <alpha-value>)',
};

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary Leaf Green aliases ───────────────────────────────────
        primary:    primaryScale,
        brand:      primaryScale,
        herb:       primaryScale,
        leaf:       primaryScale,   // ← semantic alias for #29710A
        forest:     primaryScale,
        eastbay:    primaryScale,
        suede:      primaryScale,

        // ── Soft Mint surface aliases ────────────────────────────────────
        secondary:  surfaceScale,
        mint:       surfaceScale,   // ← semantic alias for #E4EBDF
        pearl:      surfaceScale,
        matcha:     surfaceScale,
        rumswizzle: surfaceScale,
        beige:      surfaceScale,

        // ── Dark / deep-forest text scale ────────────────────────────────
        almostblack: darkScale,
        moss:        darkScale,
        hinterlands: darkScale,

        // ── Juicy Orange accent (CTAs, warnings, highlights) ─────────────
        accent:   accentScale,
        radiate:  accentScale,   // ← re-mapped to orange (was primary before)
        gleam:    accentScale,   // ← re-mapped to orange
        autumn:   accentScale,

        // Standard Tailwind orange/amber now map to the accent scale
        orange: accentScale,
        amber: {
          ...accentScale,
          400: 'rgb(var(--amber-bright-rgb) / <alpha-value>)',
          300: 'rgb(var(--amber-bright-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--amber-bright-rgb) / <alpha-value>)',
        },
        yellow: {
          400: 'rgb(var(--amber-bright-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--amber-bright-rgb) / <alpha-value>)',
        },

        // Standard Tailwind green aliases → primary scale
        emerald: primaryScale,
        teal:    primaryScale,
        green:   primaryScale,

        // Neutral overrides
        indigo: primaryScale,
        blue:   primaryScale,

        slate: neutralScale,
        gray:  neutralScale,
        zinc:  neutralScale,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'accent-glow': '0 4px 20px rgb(var(--accent-500-rgb) / 0.45)',
        'accent-glow-lg': '0 8px 32px rgb(var(--accent-500-rgb) / 0.55)',
        'primary-glow': '0 4px 20px rgb(var(--primary-500-rgb) / 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
