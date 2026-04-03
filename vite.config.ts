import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    proxy: {
      '/proxy/paypal': {
        target: 'https://www.paypal-status.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/paypal/, ''),
      },
      '/proxy/adyen': {
        target: 'https://status.adyen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/adyen/, ''),
      },
    },
  },
})