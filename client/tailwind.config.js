/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm cream background (PeoplePay style)
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F5EFE0',
          300: '#EDE3CB',
          400: '#DED0B0',
          500: '#C8B990',
        },
        // Primary — deep purple/navy (PeoplePay dark button)
        primary: {
          50: '#F4F0F8',
          100: '#E9E0F2',
          200: '#D2BFE5',
          300: '#B093CF',
          400: '#8D65B8',
          500: '#6B40A0',
          600: '#4D2D7A', // Main — deep purple
          700: '#3D2262',
          800: '#2E194A',
          900: '#211235',
          950: '#140B22',
        },
        // Warm amber/yellow accent (PeoplePay highlight color)
        accent: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE480',
          300: '#FFD233',
          400: '#F5BC00',
          500: '#D4A017',
          600: '#B8850F',
          700: '#96680A',
          800: '#7A5208',
          900: '#5C3D05',
        },
        // Soft green for success/badges
        sage: {
          50: '#F0F7F0',
          100: '#D8EDDA',
          200: '#B0D9B5',
          300: '#7FC089',
          400: '#52A45E',
          500: '#3A8A48',
        },
        slate: {
          50: '#FAF9F6',
          100: '#F3F1EC',
          200: '#E8E5DE',
          300: '#D5D1C8',
          400: '#A8A398',
          500: '#777267',
          600: '#5D594F',
          700: '#464239',
          800: '#302D28',
          850: '#24221F',
          900: '#1D1B19',
          950: '#12110F',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'DM Sans', 'system-ui', 'sans-serif'],
        handwritten: ['Newsreader', 'Georgia', 'serif'],
      },
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'soft': '0 4px 20px -2px rgba(0,0,0,0.08), 0 2px 8px -1px rgba(0,0,0,0.04)',
        'soft-lg': '0 12px 40px -4px rgba(0,0,0,0.10), 0 4px 16px -2px rgba(0,0,0,0.05)',
        'warm': '0 4px 24px 0 rgba(113,75,30,0.10)',
        'odoo': '0 2px 8px 0 rgba(77,45,122,0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}