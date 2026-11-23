// Pruebas de PanelModelo — el componente que la checklist de la Sesión 45 toca
// en los puntos 10 y 11 (elegir una pieza y cambiar de modelo deben redibujar).
// Todo se prueba por lo que ve el usuario: roles accesibles y texto, no clases CSS.
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PanelModelo } from './PanelModelo'
import { CATALOGO } from '../modelos'
import type { Ficha } from '../modelos/tipos'

const [MVC, CAPAS] = CATALOGO
// Función de ejemplo para el atajo de pruebas: MVC y CAPAS existen en el catálogo.

function montar(extra: Partial<React.ComponentProps<typeof PanelModelo>> = {}) {
  const props = {
    def: MVC,
    piezaId: null,
    ficha: null,
    alElegirModelo: vi.fn(),
    alElegirPieza: vi.fn(),
    ...extra,
  }
  return { ...render(<PanelModelo {...props} />), props }
}

describe('PanelModelo', () => {
  it('muestra una pestaña por cada modelo del catálogo', () => {
    montar()
    const tabs = screen.getByRole('group', { name: /elegir modelo/i })
    expect(tabs.querySelectorAll('button')).toHaveLength(CATALOGO.length)
  })

  it('marca con aria-pressed el modelo activo', () => {
    montar()
    expect(screen.getByRole('button', { name: MVC.nombre })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: CAPAS.nombre })).toHaveAttribute('aria-pressed', 'false')
  })

  it('avisa al padre al elegir otro modelo', async () => {
    const usuario = userEvent.setup()
    const { props } = montar()
    await usuario.click(screen.getByRole('button', { name: CAPAS.nombre }))
    expect(props.alElegirModelo).toHaveBeenCalledWith(CAPAS.id)
  })

  it('pinta un botón por cada pieza del modelo', () => {
    montar()
    const grupo = screen.getByRole('group', { name: /piezas del modelo/i })
    expect(grupo.querySelectorAll('button')).toHaveLength(MVC.piezas.length)
  })

  it('al pulsar una pieza avisa con su id', async () => {
    const usuario = userEvent.setup()
    const { props } = montar()
    const primera = MVC.piezas[0]
    await usuario.click(screen.getByRole('button', { name: new RegExp(primera.nombre, 'i') }))
    expect(props.alElegirPieza).toHaveBeenCalledWith(primera.id)
  })

  it('al pulsar la pieza ya elegida la suelta (null)', async () => {
    const usuario = userEvent.setup()
    const primera = MVC.piezas[0]
    const { props } = montar({ piezaId: primera.id })
    await usuario.click(screen.getByRole('button', { name: new RegExp(primera.nombre, 'i') }))
    expect(props.alElegirPieza).toHaveBeenCalledWith(null)
  })

  it('sin pieza elegida explica qué hacer', () => {
    montar({ piezaId: null })
    expect(screen.getByText(/toca una pieza del modelo/i)).toBeInTheDocument()
  })

  it('con una pieza elegida muestra su resumen', () => {
    const pieza = MVC.piezas[0]
    montar({ piezaId: pieza.id })
    expect(screen.getByRole('heading', { name: new RegExp(pieza.nombre, 'i') })).toBeInTheDocument()
    expect(screen.getByText(pieza.resumen)).toBeInTheDocument()
  })

  it('sin ficha descargada avisa de que falta el detalle ampliado', () => {
    montar({ piezaId: MVC.piezas[0].id, ficha: null })
    expect(screen.getByText(/detalle ampliado no disponible/i)).toBeInTheDocument()
  })

  it('con ficha muestra la responsabilidad y las piezas con las que habla', () => {
    const pieza = MVC.piezas[0]
    const otra = MVC.piezas[1]
    const ficha: Ficha = {
      id: MVC.id,
      nombre: MVC.nombre,
      resumen: 'resumen de prueba',
      cuando_usarlo: 'cuando conviene',
      riesgo: 'riesgo conocido',
      piezas: {
        [pieza.id]: { responsabilidad: 'Hace una cosa concreta.', habla_con: [otra.id] },
      },
    }
    montar({ piezaId: pieza.id, ficha })
    expect(screen.getByText(/hace una cosa concreta/i)).toBeInTheDocument()
    // El nombre de la otra pieza aparece en el chip y en el detalle: se busca
    // dentro del bloque de detalle para no depender de cuántas veces se repita.
    const detalle = document.querySelector('#pieza-detalle')!
    expect(detalle.textContent).toContain(otra.nombre)
  })

  it('el detalle de la pieza es una región aria-live (se anuncia al cambiar)', () => {
    montar()
    const detalle = document.querySelector('#pieza-detalle')
    expect(detalle).toHaveAttribute('aria-live', 'polite')
  })
})
