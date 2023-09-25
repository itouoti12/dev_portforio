import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import postcss from './postcss.config.js';

export default defineConfig({
  plugins: [sveltekit()],
  assetsInclude:['**/*.glb','**/*.vrm','**/*.fbx','**/*.png','**/*.jpg'],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  css: {
    postcss
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: './build'
  },
  preview: {
    host: true,
    port: 3000
  }
});
