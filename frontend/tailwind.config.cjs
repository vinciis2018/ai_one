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
        greenLight: 'var(--green-light)'
      },
  
      animation: {
        marquee: 'marquee 5s linear infinite',
        'float-particle': 'float-particle 20s infinite',
        'twinkle': 'twinkle 3s infinite',
        'scroll': 'scroll 30s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-particle': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-100vh) translateX(100px)', opacity: '0' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blink': {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.8)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { 
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.5)',
          },
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
