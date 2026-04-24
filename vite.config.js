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
    // Sabse asaan tarika: Relative path use karo
    // Isse '/' ya '/students-freelance/' ka jhamela hi khatam
    base: './',
})