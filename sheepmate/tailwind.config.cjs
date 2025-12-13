module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        logoBlue: '#3B82F6',
        logoViolet: '#8B5CF6',
        logoPink: '#EC4899',
        logoPurple: '#A855F7',
        logoSky: '#0EA5E9',
        green2: '#4B9154',
      },
      fontFamily: {
        header: ['Figtree', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      // You can add more from the reference file if needed
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
