// Pruebas del catálogo de modelos (Sesión 40 aplicada a la versión React).
// El catálogo es la fuente de datos de la escena: si se rompe, el visor pinta
// un modelo vacío sin dar ningún error, así que conviene fijarlo con tests.
import { describe, expect, it } from 'vitest'
import { CATALOGO, modeloPorId } from './index'
import { ROLES, type Rol } from './tipos'

const ROLES_VALIDOS = new Set(Object.keys(ROLES))

describe('CATALOGO', () => {
  it('tiene los tres modelos de arquitectura del Atlas', () => {
    expect(CATALOGO).toHaveLength(3)
  })

  it('expone los identificadores que usan los componentes y la checklist', () => {
    const ids = CATALOGO.map((m) => m.id)
    expect(ids).toEqual(['mvc', 'capas', 'microservicios'])
  })

  it('cada modelo tiene nombre, resumen y al menos una pieza', () => {
    for (const modelo of CATALOGO) {
      expect(modelo.nombre.trim(), `nombre de ${modelo.id}`).not.toBe('')
      expect(modelo.resumen.trim(), `resumen de ${modelo.id}`).not.toBe('')
      expect(modelo.piezas.length, `piezas de ${modelo.id}`).toBeGreaterThan(0)
    }
  })

  it('los identificadores de pieza son únicos dentro de cada modelo', () => {
    for (const modelo of CATALOGO) {
      const ids = modelo.piezas.map((p) => p.id)
      expect(new Set(ids).size, `piezas repetidas en ${modelo.id}`).toBe(ids.length)
    }
  })

  it('todos los enlaces apuntan a piezas que existen', () => {
    for (const modelo of CATALOGO) {
      const ids = new Set(modelo.piezas.map((p) => p.id))
      for (const enlace of modelo.enlaces) {
        expect(ids.has(enlace.de), `${modelo.id}: origen ${enlace.de}`).toBe(true)
        expect(ids.has(enlace.a), `${modelo.id}: destino ${enlace.a}`).toBe(true)
      }
    }
  })

  it('ningún enlace apunta a la propia pieza', () => {
    for (const modelo of CATALOGO) {
      for (const enlace of modelo.enlaces) {
        expect(enlace.de, `${modelo.id}: enlace ${enlace.de} → ${enlace.a}`).not.toBe(enlace.a)
      }
    }
  })

  it('cada pieza tiene un rol y una forma válidos', () => {
    const FORMAS_VALIDAS = new Set(['caja', 'cilindro', 'esfera'])
    for (const modelo of CATALOGO) {
      for (const pieza of modelo.piezas) {
        expect(ROLES_VALIDOS.has(pieza.rol), `${modelo.id}/${pieza.id}: rol ${pieza.rol}`).toBe(true)
        expect(FORMAS_VALIDAS.has(pieza.forma), `${modelo.id}/${pieza.id}: forma ${pieza.forma}`).toBe(true)
      }
    }
  })

  it('las medidas de cada pieza son positivas (un tamaño 0 sería invisible)', () => {
    for (const modelo of CATALOGO) {
      for (const pieza of modelo.piezas) {
        for (const medida of pieza.tam) {
          expect(medida, `${modelo.id}/${pieza.id}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('cada pieza trae un resumen que se puede leer sin conexión', () => {
    for (const modelo of CATALOGO) {
      for (const pieza of modelo.piezas) {
        expect(pieza.resumen.trim(), `${modelo.id}/${pieza.id}`).not.toBe('')
      }
    }
  })
})

describe('modeloPorId', () => {
  it('encuentra un modelo existente', () => {
    expect(modeloPorId('mvc')?.id).toBe('mvc')
  })

  it('devuelve undefined para un id desconocido, sin lanzar', () => {
    expect(modeloPorId('no-existe')).toBeUndefined()
  })

  it('encuentra todos los modelos del catálogo', () => {
    for (const modelo of CATALOGO) {
      expect(modeloPorId(modelo.id)).toBe(modelo)
    }
  })
})

describe('ROLES', () => {
  it('cada rol tiene nombre y color CSS para la leyenda', () => {
    for (const rol of Object.keys(ROLES) as Rol[]) {
      expect(ROLES[rol].nombre.trim()).not.toBe('')
      expect(ROLES[rol].css).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
