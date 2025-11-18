import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

 
  server: {
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api' 
      // sẽ được chuyển tiếp đến 'http://localhost:8000'
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  
});