import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    ssr: true,
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'express', 'cors', 'helmet', 'morgan', 'express-rate-limit',
        'dotenv', 'mongoose', 'bcryptjs', 'jsonwebtoken',
        'express-validator', 'uuid', 'nodemailer', 'multer', 'moment',
        'path', 'fs', 'url', 'crypto', 'os', 'stream', 'http', 'https',
      ],
    },
  },
  ssr: {
    noExternal: [],
  },
});
