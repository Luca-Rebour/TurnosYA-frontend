const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-bg': 'var(--primary-bg)',
        text: 'var(--text-main)',
      }
    }
  },
  plugins: []
}
