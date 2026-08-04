/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#EEF1FE',
          100: '#DFE4FE',
          200: '#C5CDFB',
          300: '#A2ADF5',
          400: '#7E8BEC',
          500: '#5D69DF',
          600: '#3F4FD3',
          700: '#343FBC',
          800: '#2C3496',
          900: '#272E73',
          950: '#171B43',
        },
        gold: {
          50: '#FBF6EA',
          100: '#F6EBCC',
          200: '#EDD797',
          300: '#E3BF62',
          400: '#D9A83D',
          500: '#C9932B',
          600: '#A97322',
          700: '#87571F',
          800: '#6E461E',
          900: '#5C3B1C',
          950: '#3A2410',
        },
        ink: {
          600: '#243257',
          700: '#1A2440',
          800: '#111A2E',
          850: '#0E1626',
          900: '#0B1120',
          950: '#060A12',
        },
        canvas: '#F5F6F8',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,17,32,0.04), 0 4px 16px rgba(11,17,32,0.06)',
        lift: '0 2px 4px rgba(11,17,32,0.05), 0 12px 32px rgba(11,17,32,0.10)',
        glow: '0 0 0 4px rgba(63,79,211,0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
