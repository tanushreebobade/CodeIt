import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    // tailwind v4 runs through the vite plugin; an explicit (empty) postcss config
    // stops vite from picking up unrelated postcss configs from parent folders
    postcss: { plugins: [] },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router', 'react-redux', '@reduxjs/toolkit', 'axios'],
          monaco: ['@monaco-editor/react'],
        },
      },
    },
  },
})
