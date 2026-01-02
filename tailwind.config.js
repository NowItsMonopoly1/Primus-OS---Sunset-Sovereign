/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Base / Surfaces
        'office-slate': '#F3F4F6',
        'surface': '#FFFFFF',
        'surface-muted': '#F9FAFB',
        'border-subtle': '#E5E7EB',
        'border-strong': '#CBD5F5',

        // Text
        'carbon-black': '#0B0C0D',
        'text-primary': '#0B0C0D',
        'text-secondary': '#4B5563',
        'text-muted': '#6B7280',
        'federal-navy': '#1C2A4A',

        // Brand / Primus
        'trust-blue': '#4263EB',
        'gold-alloy': '#DAC36B',
        'primus-violet': '#6A4CFF',

        // Continuity Scores
        'score-aaa': '#1C7C54',
        'score-aa': '#2F855A',
        'score-a': '#4C956C',
        'score-bbb': '#9CA3AF',
        'score-bb': '#FBBF24',
        'score-b': '#F59E0B',

        // States
        'focus-ring': '#4263EB',
        'info': '#2563EB',
        'warning': '#F59E0B',
        'critical': '#B91C1C',
      },
      fontSize: {
        'h1': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-strong': ['14px', { lineHeight: '1.6', fontWeight: '500' }],
        'label': ['12px', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.01em' }],
      },
      spacing: {
        'page': '24px',
        'card': '20px',
      },
      borderRadius: {
        'button': '4px',
        'card': '6px',
      },
    },
  },
  plugins: [],
}
