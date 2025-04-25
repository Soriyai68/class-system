import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  meteor: {
    clientEntry: 'imports/ui/main.js',
  },
  server: {
    host: true ,
  },
  optimizeDeps: {
    exclude: ['vue-meteor-tracker'],
  },
})
