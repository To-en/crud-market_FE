// https://vite.dev/config/
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Load all variable

  return {
    plugins: [
      react(),
    ], 
    build: {
      rollupOptions: {
        input: './index.html',
        },
        // future build option
    },
    
    // vitest config — inherits vite plugins (react transform) automatically
    test: {
      environment: 'node', // vm-based tests, no DOM needed
    },

    // Vite dev server setting
    server: {
      port: env.PORT ? Number(env.PORT) : 5173,
      proxy: {
        // Any route fires regardless of base url but postfix /api will proxy to backend origin
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
        },
        '^/log$': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },


  };
});



