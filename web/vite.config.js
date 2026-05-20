/** @type {import('vite').UserConfig} */
export default {
  server: {
    host: '127.0.0.1',
    port: 8946,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10638',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 8946,
    strictPort: true,
  },
};
