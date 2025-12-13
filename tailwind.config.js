/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        random:
          "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))," +
          " url('https://api.dogeow.com/images?action=random')",
      },
    },
  },
  plugins: [],
};
