/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1B4FD8",
          accent: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
