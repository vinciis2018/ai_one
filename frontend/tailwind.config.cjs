/** @type {import('tailwindcss').Config} */
module.exports = {
  // mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      figtree: ['Figtree', 'sans-serif'],
    },
    extend: {
      height: {
        "100": '25rem',
        "120": '30rem',
        "160": '40rem',
        "180": '45rem',
        "200": '50rem',
      },
      width: {
        "100": '25rem',
        "120": '30rem',
        "160": '40rem',
        "180": '45rem',
        "200": '50rem',
      },
      colors: {
        primary: 'var(--primary)',
        background: 'var(--background)',
        backgroundAlt: 'var(--background-alt)',
        text: 'var(--text)',
        primaryText: 'var(--primary-text)',
        special: 'var(--text-special)',
        violet: 'var(--violet)',
        card: 'var(--card)',
        textAlt: 'var(--text-muted)',
        lightAccent: 'var(--accent)',
        darkAccent: 'var(--accent)',
        error: 'var(--error)',
        sun: 'var(--sun)',
        moon: 'var(--moon)',
        orange1: 'var(--orange)',
        orange2: 'var(--orange2)',
        green: 'var(--green)',
        green2: 'var(--green2)',
        blue1: 'var(--blue)',
        navyBlue: 'var(--navy-blue)',
        baigeLight: 'var(--baige-light)',
      },
  
      animation: {
        marquee: 'marquee 5s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark'],
    },
  },
  plugins: [],
}
