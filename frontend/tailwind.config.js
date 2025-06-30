/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        axBlack: '#0F0F1A',      // main surface (slight violet)
        axOverlay: '#1A0827',    // bluish-purple overlay
        axMint: '#7EE787',       // highlight
        axMintDim: '#6BD67A',
        axCard: '#121212',
        axGreenBright: '#C8FF00',
        axRedBright: '#FF6666',
        axViolet: '#C9B8FF',
        // Legacy colors for compatibility
        'ax-black': '#0F0F1A',
        'ax-green': '#7EE787',
        background: "var(--background)",
        foreground: "var(--foreground)",
        'axiom-black': '#0F0F1A',
        'axiom-gray': '#1A0827',
        'axiom-green': '#7EE787',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'hue': 'hue 8s linear infinite',
        'hue-rotate': 'hue-rotate 8s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        'hue': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(-15deg)' }
        },
        'hue-rotate': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [
    nextui(),
    function({ addUtilities }) {
      addUtilities({
        '.bg-glass': {
          '@apply backdrop-blur-md bg-white/5 dark:bg-white/2': {},
        },
      });
    },
  ],
};

module.exports = config; 