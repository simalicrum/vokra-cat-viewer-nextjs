module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'vokra-light': '#bd6cda',
        'vokra-dark': '#986cda',
        'vokra-gray': '#F5F5F5',
      },
    },
    fontFamily: {
      special: ['Alice'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
