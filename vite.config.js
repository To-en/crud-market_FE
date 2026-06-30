// https://vite.dev/config/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(), // Did not use it now
  ],

  // Manual chunk technique
    // Split vendor code into dedicated chunks so chart.js (and its heavy
    // peers) only download on routes that actually render charts, and
    // react stays cacheable across deploys. See docs/code-splitting.md.
  // build: {
  //   rollupOptions: {
  //     input: './index.html', 
  //     output: {
  //       manualChunks: {
  //         'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  //         'chart-vendor': [
  //           'chart.js',
  //           'react-chartjs-2',
  //           'chartjs-plugin-zoom',
  //           'chartjs-adapter-date-fns',
  //           'hammerjs',
  //         ],
  //       },
  //     },
  //   },
  // },

  // ViteJS proxy handling like nginx, but for local dev convenience
  server: {
    port: 5173, // May be port 80 later in production
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': 'http://localhost:3000'
    },
  },
});




