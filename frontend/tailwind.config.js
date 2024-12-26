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
        poppins: ["Poppins", "sans-serif"], // For game name and description
      },
      patterns: {
        opacities: {
          100: "1",
          80: ".80",
          60: ".60",
          40: ".40",
          20: ".20",
          10: ".10",
          5: ".05",
        },
        sizes: {
          1: "0.25rem",
          2: "0.5rem",
          4: "1rem",
          6: "1.5rem",
          8: "2rem",
          16: "4rem",
          20: "5rem",
          24: "6rem",
          32: "8rem",
        },
      },
      colors: {
        primary: {
          DEFAULT: "#10B981", // Gamer green as primary color
          light: "#34D399", // Lighter variant of gamer green
          dark: "#059669", // Darker variant of gamer green
        },
        background: {
          DEFAULT: "#FFFFFF", // White background
        },
        text: {
          primary: "#10B981", // Gamer green for text
          secondary: "#374151", // Gray for secondary text
        },
        border: {
          primary: "#10B981", // Gamer green for borders
        },
      },
    },
  },
  plugins: [require("preline/plugin"), require("tailwindcss-bg-patterns")],
};
