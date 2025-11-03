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
        backgroundLandingAlt: 'var(--background-landing-alt)',
        backgroundCardViolet: 'var(--background-card-violet)',
        backgroundCardNavyBlue: 'var(--background-card-navy-blue)',
        text: 'var(--text)',
        primaryText: 'var(--primary-text)',
        textSpecial: 'var(--text-special)',
        textLandingViolet: 'var(--text-landing-violet)',
        textLandingYellow: 'var(--text-landing-yellow)',

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
        green1: 'var(--green)',
        green2: 'var(--green2)',
        blue1: 'var(--blue)',
        navyBlue: 'var(--navy-blue)',
        violetLight: 'var(--violet-light)',
        violetLightCircle: 'var(--violet-light-circle)'
      },
      borderColor: {
        'red': '#EF4444',
        'green': '#10B981',
        'blue': '#3B82F6',
        'violet': '#7850CD',
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
