import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── KAUTAQ Base Palette ─────────────────────────────────────────
        // Vaporous Beige #DFDFD4  →  beige / pearl (warm neutral background)
        // Autumn         #DC7000  →  autumn / gleam / radiate (warm amber CTA & accent)
        // Almost Black   #1B1E1C  →  almostblack / moss (deep charcoal dark)
        // Suede Green    #6E883F  →  suede / herb / brand (earthy olive green)
        // Hinterlands    #31410D  →  hinterlands (deep forest olive)

        beige: {
          50:  '#FAF9F6',
          100: '#F4F4EE',
          200: '#DFDFD4', // Vaporous Beige (Base)
          300: '#CBCBBF',
          400: '#B4B4A4',
          500: '#999988',
          600: '#7D7D6E',
          700: '#626256',
          800: '#48483F',
          900: '#31312B',
          DEFAULT: '#DFDFD4',
        },

        autumn: {
          50:  '#FEF7EE',
          100: '#FDEDD3',
          200: '#FBD8A5',
          300: '#F7BD6E',
          400: '#F19830',
          500: '#DC7000', // Autumn (Base)
          600: '#C05900',
          700: '#984102',
          800: '#7B3408',
          900: '#652D0C',
          DEFAULT: '#DC7000',
        },

        almostblack: {
          50:  '#F5F6F5',
          100: '#E6E8E6',
          200: '#C5C9C5',
          300: '#9EA49F',
          400: '#6E7670',
          500: '#4B534D',
          600: '#383E3A',
          700: '#2A2F2B',
          800: '#202421',
          900: '#1B1E1C', // Almost Black (Base)
          950: '#111312',
          DEFAULT: '#1B1E1C',
        },

        suede: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F', // Suede Green (Base)
          600: '#566C31',
          700: '#425426',
          800: '#364321',
          900: '#2F3A1E',
          DEFAULT: '#6E883F',
        },

        hinterlands: {
          50:  '#F3F6EC',
          100: '#E3EBD3',
          200: '#C8D7AD',
          300: '#A7C07E',
          400: '#668031',
          500: '#485F1B',
          600: '#3B4E15',
          700: '#31410D', // Hinterlands (Base)
          800: '#25330A',
          900: '#1A2407',
          950: '#111804',
          DEFAULT: '#31410D',
        },

        // ── Standard Tailwind Color Overrides (Mapping all to KAUTAQ) ────
        emerald: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F', // Suede Green
          600: '#566C31',
          700: '#425426',
          800: '#31410D', // Hinterlands
          900: '#25330A',
          950: '#111804',
          DEFAULT: '#6E883F',
        },

        teal: {
          50:  '#F3F6EC',
          100: '#E3EBD3',
          200: '#C8D7AD',
          300: '#A7C07E',
          400: '#668031',
          500: '#6E883F',
          600: '#566C31',
          700: '#31410D', // Hinterlands
          800: '#25330A',
          900: '#1A2407',
          DEFAULT: '#31410D',
        },

        green: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F', // Suede Green
          600: '#566C31',
          700: '#425426',
          800: '#31410D', // Hinterlands
          900: '#25330A',
          DEFAULT: '#6E883F',
        },

        indigo: {
          50:  '#F3F6EC',
          100: '#E3EBD3',
          200: '#C8D7AD',
          300: '#A7C07E',
          400: '#668031',
          500: '#485F1B',
          600: '#3B4E15',
          700: '#31410D', // Hinterlands
          800: '#25330A',
          900: '#1A2407',
          DEFAULT: '#31410D',
        },

        blue: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F',
          600: '#566C31',
          700: '#31410D', // Hinterlands
          800: '#25330A',
          900: '#1A2407',
          DEFAULT: '#6E883F',
        },

        amber: {
          50:  '#FEF7EE',
          100: '#FDEDD3',
          200: '#FBD8A5',
          300: '#F7BD6E',
          400: '#F19830',
          500: '#DC7000', // Autumn
          600: '#C05900',
          700: '#984102',
          800: '#7B3408',
          900: '#652D0C',
          DEFAULT: '#DC7000',
        },

        orange: {
          50:  '#FEF7EE',
          100: '#FDEDD3',
          200: '#FBD8A5',
          300: '#F7BD6E',
          400: '#F19830',
          500: '#DC7000', // Autumn
          600: '#C05900',
          700: '#984102',
          800: '#7B3408',
          900: '#652D0C',
          DEFAULT: '#DC7000',
        },

        slate: {
          50:  '#FAF9F6',
          100: '#F4F4EE',
          200: '#DFDFD4', // Vaporous Beige
          300: '#CBCBBF',
          400: '#9EA49F',
          500: '#6E7670',
          600: '#4B534D',
          700: '#383E3A',
          800: '#202421',
          900: '#1B1E1C', // Almost Black
          950: '#111312',
          DEFAULT: '#1B1E1C',
        },

        gray: {
          50:  '#FAF9F6',
          100: '#F4F4EE',
          200: '#DFDFD4', // Vaporous Beige
          300: '#CBCBBF',
          400: '#9EA49F',
          500: '#6E7670',
          600: '#4B534D',
          700: '#383E3A',
          800: '#202421',
          900: '#1B1E1C', // Almost Black
          950: '#111312',
          DEFAULT: '#1B1E1C',
        },

        zinc: {
          50:  '#FAF9F6',
          100: '#F4F4EE',
          200: '#DFDFD4', // Vaporous Beige
          300: '#CBCBBF',
          400: '#9EA49F',
          500: '#6E7670',
          600: '#4B534D',
          700: '#383E3A',
          800: '#202421',
          900: '#1B1E1C', // Almost Black
          950: '#111312',
          DEFAULT: '#1B1E1C',
        },

        // ── Semantic & Theme Aliases ─────────────────────────────────────
        pearl: {
          50:  '#FAF9F6',
          100: '#F4F4EE',
          200: '#DFDFD4', // Vaporous Beige
          300: '#CBCBBF',
          400: '#B4B4A4',
          500: '#999988',
          600: '#7D7D6E',
          700: '#626256',
          800: '#48483F',
          900: '#31312B',
          DEFAULT: '#DFDFD4',
        },

        gleam: {
          50:  '#FEF7EE',
          100: '#FDEDD3',
          200: '#FBD8A5',
          300: '#F7BD6E',
          400: '#F19830',
          500: '#DC7000', // Autumn
          600: '#C05900',
          700: '#984102',
          800: '#7B3408',
          900: '#652D0C',
          DEFAULT: '#DC7000',
        },

        radiate: {
          50:  '#FEF7EE',
          100: '#FDEDD3',
          200: '#FBD8A5',
          300: '#F7BD6E',
          400: '#F19830',
          500: '#DC7000', // Autumn
          600: '#C05900',
          700: '#984102',
          800: '#7B3408',
          900: '#652D0C',
          DEFAULT: '#DC7000',
        },

        herb: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F', // Suede Green
          600: '#566C31',
          700: '#425426',
          800: '#364321',
          900: '#2F3A1E',
          DEFAULT: '#6E883F',
        },

        brand: {
          50:  '#F4F7EF',
          100: '#E5ECDB',
          200: '#CCDAB9',
          300: '#ADC390',
          400: '#8DA762',
          500: '#6E883F', // Suede Green
          600: '#566C31',
          700: '#425426',
          800: '#364321',
          900: '#2F3A1E',
          DEFAULT: '#6E883F',
        },

        moss: {
          50:  '#F5F6F5',
          100: '#E6E8E6',
          200: '#C5C9C5',
          300: '#9EA49F',
          400: '#6E7670',
          500: '#4B534D',
          600: '#383E3A',
          700: '#2A2F2B',
          800: '#202421',
          900: '#1B1E1C', // Almost Black
          950: '#111312',
          DEFAULT: '#1B1E1C',
        },
      },
    },
  },
  plugins: [],
};

export default config;
