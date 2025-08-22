import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://farylve.online',
    headless: true,
  },
  reporter: [['list']],
});