/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome color tokens as specified in the requirements
        'bg': '#FFFFFF',
        'fg': '#000000',
        'muted': '#9A9A9A',
        'outline': '#E6E6E6',
        'hover': 'rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'body': '16px',
        'content': '18px',
        'title': '20px',
        'cover': '24px',
      },
      lineHeight: {
        'long': '1.6',
        'thread': '1.4',
      },
      maxWidth: {
        'content': '720px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#000000',
            a: {
              color: '#000000',
              '&:hover': {
                color: '#000000',
              },
            },
            h1: {
              color: '#000000',
            },
            h2: {
              color: '#000000',
            },
            h3: {
              color: '#000000',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
