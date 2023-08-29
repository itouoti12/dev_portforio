import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    // paths: { base: process.env.NODE_ENV === 'development' ? '' : '/dev_portforio' },
    paths: { base: process.env.NODE_ENV === 'development' ? '' : '' },
    serviceWorker: { register: false },
  }
};

export default config;
