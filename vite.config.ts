import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue'
import ElementPlus from 'unplugin-element-plus/vite'



export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue(),ElementPlus({})
    ],
    define: {
      'process.env': env,
    },
  };
});