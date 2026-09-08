import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        crm: {
          base: '#071A1D',             // Deep dark-cyan canvas
          surface: '#0A2428',          // Surface / Sidebar container
          elevated: '#0D2D32',         // Elevated card / hover state
          accent: '#16C1C8',           // Primary vibrant cyan accent
          highlight: '#22D3DA',        // Luminous highlight & glow
          header: '#071A1D',           // Application top bar
          sidebar: '#0A2428',          // Left navigation bar
          'sidebar-hover': '#0D2D32',  // Navigation hover state
          'sidebar-active': '#0D2D32', // Navigation active container
          background: '#F6F9F9',       // Clean, crisp content canvas
          card: '#FFFFFF',             // White card surface
          border: '#E1EBEB',           // Soft cyan-gray border
          'border-dark': '#0D2D32',    // Dark cyan border
          'table-header': '#F0F6F6',   // Soft table header
          'table-row-hover': '#F6FAFA',
          teal: {
            DEFAULT: '#16C1C8',
            hover: '#13ABB1',
            light: 'rgba(22, 193, 200, 0.12)',
          },
          primary: '#16C1C8',
          muted: '#5A7175',
          text: '#071A1D',
        },
      },
    },
  },
  plugins: [],
};

export default config;
