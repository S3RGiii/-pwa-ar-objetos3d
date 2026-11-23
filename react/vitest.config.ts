import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Configuración sola para las pruebas: no toca la del build (vite.config.ts),
// que genera el Service Worker con Workbox. Mezclarlas obligaría a que cada
// `npm test` construyera un Service Worker, que no hace falta aquí.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/pruebas/configuracion.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Solo se mide lo que tiene lógica propia: componentes, hooks y modelos.
      // visor.ts, xr.ts y sw.ts dependen de WebGL/WebXR y no se pueden medir en jsdom.
      include: ['src/hooks/**', 'src/modelos/**', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/pruebas/**'],
    },
  },
})
