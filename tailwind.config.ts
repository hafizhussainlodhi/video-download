import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        surface: '#131B2E',
        'surface-raised': '#1B2540',
        hairline: '#26314A',
        signal: {
          DEFAULT: '#29D3C0',
          dim: '#1D9C90',
          glow: 'rgba(41, 211, 192, 0.18)',
        },
        warm: {
          DEFAULT: '#FF7A59',
          dim: '#D9603F',
        },
        text: {
          primary: '#EAF0F6',
          muted: '#8592AA',
          faint: '#586380',
        },
        success: '#34D399',
        danger: '#F87171',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        signal: '0 0 0 1px rgba(41,211,192,0.25), 0 8px 30px -8px rgba(41,211,192,0.35)',
      },
      keyframes: {
        pulseFlow: {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0.4' },
          '50%': { transform: 'translateX(6px)', opacity: '1' },
        },
        fillMeter: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseFlow: 'pulseFlow 1.2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
