/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "poppins-regular": ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-semiBold": ["Poppins-SemiBold"],
        "poppins-bold": ["Poppins-Bold"],
      },
      colors: {
        primary: "#0ea5e9",
        black: "#083344",
        white: "#f0f9ff",
      },
    },
  },
  plugins: [],
};
