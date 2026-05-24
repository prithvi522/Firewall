/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./public/index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 70px rgba(20, 184, 166, 0.18)",
      },
    },
  },
  plugins: [],
};
