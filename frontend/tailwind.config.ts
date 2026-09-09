import type { Config } from 'tailwindcss';

const primaryScale = {
  50: 'rgb(var(--primary-50-rgb) / <alpha-value>)',
  100: 'rgb(var(--primary-100-rgb) / <alpha-value>)',
  200: 'rgb(var(--primary-200-rgb) / <alpha-value>)',
  300: 'rgb(var(--primary-300-rgb) / <alpha-value>)',
  400: 'rgb(var(--primary-400-rgb) / <alpha-value>)',
  500: 'rgb(var(--primary-500-rgb) / <alpha-value>)',
  600: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
  700: 'rgb(var(--primary-700-rgb) / <alpha-value>)',
  800: 'rgb(var(--primary-800-rgb) / <alpha-value>)',
  900: 'rgb(var(--primary-900-rgb) / <alpha-value>)',
  950: 'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
};

const backgroundScale = {
  50: 'rgb(var(--bg-50-rgb) / <alpha-value>)',
  100: 'rgb(var(--bg-100-rgb) / <alpha-value>)',
  200: 'rgb(var(--bg-200-rgb) / <alpha-value>)',
  300: 'rgb(var(--bg-300-rgb) / <alpha-value>)',
  400: 'rgb(var(--bg-400-rgb) / <alpha-value>)',
  500: 'rgb(var(--bg-500-rgb) / <alpha-value>)',
  600: 'rgb(var(--bg-600-rgb) / <alpha-value>)',
  700: 'rgb(var(--bg-700-rgb) / <alpha-value>)',
  800: 'rgb(var(--bg-800-rgb) / <alpha-value>)',
  900: 'rgb(var(--bg-900-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--bg-200-rgb) / <alpha-value>)',
};

const darkNightScale = {
  50: 'rgb(var(--primary-50-rgb) / <alpha-value>)',
  100: 'rgb(var(--primary-100-rgb) / <alpha-value>)',
  200: 'rgb(var(--primary-200-rgb) / <alpha-value>)',
  300: 'rgb(var(--primary-300-rgb) / <alpha-value>)',
  400: 'rgb(var(--primary-400-rgb) / <alpha-value>)',
  500: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
  600: 'rgb(var(--primary-700-rgb) / <alpha-value>)',
  700: 'rgb(var(--primary-800-rgb) / <alpha-value>)',
  800: 'rgb(var(--primary-900-rgb) / <alpha-value>)',
  900: 'rgb(var(--primary-900-rgb) / <alpha-value>)',
  950: 'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
};

const neutralScale = {
  50: 'rgb(var(--bg-50-rgb) / <alpha-value>)',
  100: 'rgb(var(--bg-100-rgb) / <alpha-value>)',
  200: 'rgb(var(--bg-200-rgb) / <alpha-value>)',
  300: 'rgb(var(--border-rgb) / <alpha-value>)',
  400: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
  500: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
  600: 'rgb(var(--text-body-rgb) / <alpha-value>)',
  700: 'rgb(var(--primary-700-rgb) / <alpha-value>)',
  800: 'rgb(var(--primary-800-rgb) / <alpha-value>)',
  900: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
  950: 'rgb(var(--primary-950-rgb) / <alpha-value>)',
  DEFAULT: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
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
        // ── Dynamic Theme CSS-Variable Mappings ─────────────────────────
        primary: primaryScale,
        eastbay: primaryScale,
        brand: primaryScale,
        herb: primaryScale,
        suede: primaryScale,

        secondary: backgroundScale,
        rumswizzle: backgroundScale,
        beige: backgroundScale,
        pearl: backgroundScale,

        almostblack: darkNightScale,
        moss: darkNightScale,
        hinterlands: darkNightScale,

        autumn: primaryScale,
        radiate: primaryScale,
        gleam: {
          50: 'rgb(var(--bg-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--bg-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--bg-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--bg-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--bg-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--primary-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--primary-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--primary-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--primary-900-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
        },

        // Standard Tailwind Overrides for dynamic theme compatibility
        emerald: primaryScale,
        teal: primaryScale,
        green: primaryScale,
        indigo: primaryScale,
        blue: primaryScale,
        amber: primaryScale,
        orange: primaryScale,

        slate: neutralScale,
        gray: neutralScale,
        zinc: neutralScale,
      },
    },
  },
  plugins: [],
};

export default config;
