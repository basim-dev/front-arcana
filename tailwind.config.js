/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        light: "url('/images/background-light.jpg')",
        dark: "url('/images/background-dark.jpg')",
      },
      colors: {
        arcanaBackgroundDarker: "#14181A",
        arcanaBackgroundLighter: "#212629",
        arcanaBlue: "#70D6FF",
        arcanaPurple: "#A459D1",
        arcanaBackgroundBlue: "#141719",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
