export default {
  content: [
    './app/**/*.vue',
    './app/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        persephone: {
          bg:      '#d0d7dd',
          text:    '#424242',
          accent:  '#2071c1',
          surface: '#e8edf1',
          muted:   '#7a8a96',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}