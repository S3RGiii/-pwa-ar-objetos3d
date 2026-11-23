// Pruebas del catálogo de modelos en la versión Angular (Sesión 44).
// El catálogo es el mismo que en la versión sin framework y en React: aquí se
// comprueba que la copia de Angular no se ha desincronizado, porque el visor
// pinta directamente a partir de estos datos.
import { describe, expect, it } from 'vitest'
import { CATALOGO, modeloPorId } from './index'
import { ROLES } from './tipos'

const ROLES_VALIDOS = new Set(Object.keys(ROLES))

describe('CATALOGO (Angular)', () => {
  it('tiene los tres modelos de arquitectura', () => {
    expect(CATALOGO).toHaveLength(3)
  })

  it('los identificadores son los que esperan los componentes y la checklist', () => {
    expect(CATALOGO.map((m) => m.id)).toEqual(['mvc', 'capas', 'microservicios'])
  })

  it('cada modelo tiene nombre, resumen y piezas', () => {
    for (const modelo of CATALOGO) {
      expect(modelo.nombre.trim(), modelo.id).not.toBe('')
      expect(modelo.resumen.trim(), modelo.id).not.toBe('')
      expect(modelo.piezas.length, modelo.id).toBeGreaterThan(0)
    }
  })

  it('los ids de pieza son únicos dentro del modelo', () => {
    for (const modelo of CATALOGO) {
      const ids = modelo.piezas.map((p) => p.id)
      expect(new Set(ids).size, modelo.id).toBe(ids.length)
    }
  })

  it('los enlaces apuntan a piezas que existen y no a sí mismos', () => {
    for (const modelo of CATALOGO) {
      const ids = new Set(modelo.piezas.map((p) => p.id))
      for (const enlace of modelo.enlaces) {
        expect(ids.has(enlace.de), `${modelo.id}: ${enlace.de}`).toBe(true)
        expect(ids.has(enlace.a), `${modelo.id}: ${enlace.a}`).toBe(true)
        expect(enlace.de, `${modelo.id}: enlace reflexivo`).not.toBe(enlace.a)
      }
    }
  })

  it('roles y formas son válidos, y las medidas positivas', () => {
    const FORMAS = new Set(['caja', 'cilindro', 'esfera'])
    for (const modelo of CATALOGO) {
      for (const pieza of modelo.piezas) {
        expect(ROLES_VALIDOS.has(pieza.rol), `${modelo.id}/${pieza.id}`).toBe(true)
        expect(FORMAS.has(pieza.forma), `${modelo.id}/${pieza.id}`).toBe(true)
        for (const medida of pieza.tam) {
          expect(medida, `${modelo.id}/${pieza.id}`).toBeGreaterThan(0)
        }
        expect(pieza.resumen.trim(), `${modelo.id}/${pieza.id}`).not.toBe('')
      }
    }
  })
})

describe('modeloPorId (Angular)', () => {
  it('encuentra cada modelo del catálogo', () => {
    for (const modelo of CATALOGO) {
      expect(modeloPorId(modelo.id)).toBe(modelo)
    }
  })

  it('devuelve undefined sin lanzar para un id que no existe', () => {
    expect(modeloPorId('no-existe')).toBeUndefined()
  })
})
