import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/students-freelance/', // Yahan tumhari repo ka naam hona chahiye
  plugins: [react()],
})
