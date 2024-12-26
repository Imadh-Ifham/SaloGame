/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        press: ['"Press Start 2P"', "cursive"], // Add custom font
      },
    },
  },
  plugins: [require("preline/plugin")],
};
