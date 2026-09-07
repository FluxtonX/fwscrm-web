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
      colors: {
        crm: {
          header: '#0F172A',         // Dark navy/blue application header
          sidebar: '#1E293B',        // Dark blue left navigation
          'sidebar-hover': '#334155',
          'sidebar-active': '#0284C7',
          background: '#F8FAFC',     // Very light blue/gray page background
          surface: '#FFFFFF',        // White content panels
          border: '#E2E8F0',         // Soft border
          'table-header': '#F1F5F9', // Light blue/gray table header
          'table-row-hover': '#F8FAFC',
          teal: {
            DEFAULT: '#0D9488',      // Teal action button default
            hover: '#0F766E',
            light: '#CCFBF1',
          },
          primary: '#0284C7',
          muted: '#64748B',
          text: '#0F172A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
