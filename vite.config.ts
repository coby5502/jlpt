import { defineConfig } from 'vite';

export default defineConfig({
  base: '/jlpt/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
