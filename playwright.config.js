import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/deployment',
  use: { baseURL: 'http://127.0.0.1:4173/persona-lab/' },
  webServer: {
    command: 'npm exec vite preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/persona-lab/',
    reuseExistingServer: false,
  },
});
