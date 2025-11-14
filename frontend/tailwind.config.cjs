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
        "124": '31rem',
        "128": '32rem',
        "132": '33rem',
        "136": '34rem',
        "140": '35rem',
        "160": '40rem',
        "180": '45rem',
        "200": '50rem',
      },
      width: {
        "84": "21rem",
        "88": "22rem",
        "92": "23rem",
        "96": "24rem",
        "100": '25rem',
        "120": '30rem',
        "140": '35rem',
        "160": '40rem',
        "180": '45rem',
        "200": '50rem',
      },
      colors: {
        primary: 'var(--primary)',
        background: 'var(--background)',
        backgroundAlt: 'var(--background-alt)',
        bgDarkGreen: 'var(--background-dark-green)',
        violet: 'var(--violet)',
        card: 'var(--card)',
        textAlt: 'var(--text-muted)',
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
        greenLight: 'var(--green-light)',
        redLight: 'var(--red-light)'
      },
      borderRadius: {
        '4xl': '2rem',
        '6xl': '3rem',
        '8xl': '4rem'
      },
      rotate: {
        '10': '10deg',
        '15': '15deg',
        '20': '20deg',
        '25': '25deg',
        '30': '30deg',
        '45': '45deg',
        '60': '60deg',
        '90': '90deg',
        '120': '120deg',
        '135': '135deg',
        '180': '180deg',
        '270': '270deg',
      },
      animation: {
        marquee: 'marquee 5s linear infinite',
        'float-particle': 'float-particle 20s infinite',
        'twinkle': 'twinkle 3s infinite',
        'scroll': 'scroll 30s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        pulse1: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        pulse2: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'float2': 'float 5s ease-in-out infinite',
        'float3': 'float 3s ease-in-out infinite',

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
            opacity: '0.5',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.9',
            transform: 'scale(1.5)',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-20px)' 
          },
        },
          float2: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-16px)' 
          },
        },
          float3: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-24px)' 
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
