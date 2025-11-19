/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive'],
      },
      animation: {
        'ink': 'inkSpread 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        inkSpread: {
          '0%': { opacity: '0', transform: 'scale(0.8)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}