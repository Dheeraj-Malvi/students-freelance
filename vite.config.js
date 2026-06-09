// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig(({ command }) => {
//   return {
//   base: command === 'build' ? '/students-freelance/' : '/',
//   plugins: [react()],
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({ 
    plugins: [react()],
    // Use relative base path for both development and production
    base: '/',
})