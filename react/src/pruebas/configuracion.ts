// Configuración compartida por todas las pruebas de la versión React.
// `jest-dom` añade aserciones sobre el DOM (toBeInTheDocument, etc.).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom no implementa matchMedia ni IntersectionObserver y los componentes los
// consultan (prefers-reduced-motion, scrollIntoView). Se sustituyen por dobles
// mínimos para que los tests no dependan del navegador.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
}
