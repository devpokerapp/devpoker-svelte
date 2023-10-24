/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/routes/**/*.{svelte,js,ts}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "pastel"],
  },
  plugins: [require("daisyui")],
}

