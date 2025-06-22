/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pacifico': ['Pacifico', 'cursive'],
      },
      colors: {
        background: '#F8F9FA', // Off-white
        primary: '#8ECAE6',    // Pastel Blue
        secondary: '#FFB4A2',  // Pastel Red/Salmon
        accent: '#FFD670',     // Pastel Yellow/Gold
        'text-primary': '#2B2D42',    // Dark Slate
        'text-secondary': '#8D99AE', // Light Slate
      }
    },
  },
  plugins: [],
}; 