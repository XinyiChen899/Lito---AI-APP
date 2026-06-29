/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        lito: {
          beige: '#E8DCC4',
          light: '#F5EEE6',
          brown: '#D4C4A8',
          dark: '#8B7355',
          ear: '#FFD93D',
          earLight: '#FFF3B0',
          eye: '#4A3728',
          nose: '#3D2E22',
        },
        cream: '#FFF8E7',
        coral: '#FFB347',
        peach: '#FFDAB9',
        gold: '#FFD700',
        dream: {
          dark: '#7B68EE',
          light: '#B19CD9',
          purple: '#9370DB',
        },
        connection: '#FFB347',
        energy: '#FFD700',
        curiosity: '#87CEEB',
        calmness: '#98FB98',
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'cursive'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(107, 91, 149, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(107, 91, 149, 0.8)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};