/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#000000', // Changed from blue to black
        'brand-primary-hover': '#333333', // Darker black for hover
        'brand-accent': '#00A2FF',
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(180deg,var(--gradient-start, #FFF9F5) 0%,var(--gradient-mid1, #ECECFF) 30%,var(--gradient-mid2, #BFD7FF) 65%,var(--gradient-end, #CCE8FF) 100%)',
      },
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.placeholder-black::placeholder': {
          color: '#000000',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}; 