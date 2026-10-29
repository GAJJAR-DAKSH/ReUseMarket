/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9F6',
        primary: {
          DEFAULT: '#245C45',
          hover: '#1B4634',
          light: '#EAF2EE',
          surface: '#F0F6F3',
          border: '#D0E1D9',
        },
        charcoal: {
          DEFAULT: '#202620',
          muted: '#737A74',
          subtle: '#9CA39D',
          border: '#E6E9E4',
          surface: '#FFFFFF',
          light: '#F3F5F1',
        },
        accent: {
          green: '#2D7A5D',
          amber: '#D97706',
          rose: '#BE123C',
          blue: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'subtle': '10px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 25px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
