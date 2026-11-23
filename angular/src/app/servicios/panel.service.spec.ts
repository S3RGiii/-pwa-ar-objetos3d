// Pruebas de PanelService (Sesión 44).
// El servicio es el corazón de la versión Angular: sustituye a las seis
// funciones que en la Sesión 40 reescribían el HTML. Se prueba con
// TestBed, que es la forma canónica de inyectar dependencias en Angular.
//
// VisorService se sustituye por un doble: crear el visor real exige WebGL, que
// jsdom no implementa. Se comprueba lo que importa —que el servicio pide al
// visor lo correcto y actualiza sus señales—, no Three.js.
import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signal } from '@angular/core'
import { PanelService } from './panel.service'
import { VisorService } from './visor.service'
import { CATALOGO } from '../../modelos'

function crearDobleVisor() {
  const visor = {
    mostrarModelo: vi.fn(),
    seleccionar: vi.fn(),
    alTocarPieza: vi.fn(),
  }
  return visor
}

describe('PanelService', () => {
  let servicio: PanelService
  let visor: ReturnType<typeof crearDobleVisor>
  let senalVisor: ReturnType<typeof signal<ReturnType<typeof crearDobleVisor> | null>>

  beforeEach(() => {
    visor = crearDobleVisor()
    // El servicio lee el visor de una señal; se empieza en null para probar
    // también el caso «el visor aún no está montado».
    senalVisor = signal<ReturnType<typeof crearDobleVisor> | null>(null)

    TestBed.configureTestingModule({
      providers: [
        PanelService,
        { provide: VisorService, useValue: { visor: senalVisor } },
      ],
    })
    servicio = TestBed.inject(PanelService)
  })

  it('arranca con el primer modelo del catálogo', () => {
    expect(servicio.modeloId()).toBe(CATALOGO[0].id)
    expect(servicio.def().id).toBe(CATALOGO[0].id)
  })

  it('arranca sin pieza elegida', () => {
    expect(servicio.piezaId()).toBeNull()
    expect(servicio.pieza()).toBeUndefined()
  })

  it('no hace nada si el visor todavía no está montado', () => {
    servicio.elegirModelo(CATALOGO[1].id)
    // Sin visor, elegirModelo sale antes de tocar el estado: el modelo pintado
    // y el estado tienen que seguir coherentes.
    expect(servicio.modeloId()).toBe(CATALOGO[0].id)
  })

  it('con visor montado, elegir modelo se lo pide al visor y actualiza la señal', () => {
    senalVisor.set(visor)
    servicio.elegirModelo(CATALOGO[1].id)
    expect(visor.mostrarModelo).toHaveBeenCalledTimes(1)
    expect(servicio.modeloId()).toBe(CATALOGO[1].id)
  })

  it('al cambiar de modelo se suelta la pieza elegida', () => {
    senalVisor.set(visor)
    servicio.elegirPieza(CATALOGO[0].piezas[0].id)
    expect(servicio.piezaId()).toBe(CATALOGO[0].piezas[0].id)

    servicio.elegirModelo(CATALOGO[1].id)
    expect(servicio.piezaId()).toBeNull()
  })

  it('elegir pieza se lo comunica al visor', () => {
    senalVisor.set(visor)
    const id = CATALOGO[0].piezas[0].id
    servicio.elegirPieza(id)
    expect(visor.seleccionar).toHaveBeenCalledWith(id)
    expect(servicio.piezaId()).toBe(id)
  })

  it('elegir pieza con null también llega al visor (soltar)', () => {
    senalVisor.set(visor)
    servicio.elegirPieza(null)
    expect(visor.seleccionar).toHaveBeenCalledWith(null)
    expect(servicio.piezaId()).toBeNull()
  })

  it('recorrerPiezas avanza, retrocede y da la vuelta', () => {
    senalVisor.set(visor)
    const total = CATALOGO[0].piezas.length

    // Sin pieza + 1 → primera pieza
    servicio.recorrerPiezas(1)
    expect(servicio.piezaId()).toBe(CATALOGO[0].piezas[0].id)

    // Avanzar hasta la última
    for (let i = 1; i < total; i++) servicio.recorrerPiezas(1)
    expect(servicio.piezaId()).toBe(CATALOGO[0].piezas[total - 1].id)

    // Una más → vuelve a "ninguna" (la lista empieza con null)
    servicio.recorrerPiezas(1)
    expect(servicio.piezaId()).toBeNull()
  })

  it('recorrerPiezas hacia atrás desde "ninguna" llega a la última pieza', () => {
    senalVisor.set(visor)
    servicio.recorrerPiezas(-1)
    expect(servicio.piezaId()).toBe(CATALOGO[0].piezas[CATALOGO[0].piezas.length - 1].id)
  })

  it('la ficha empieza vacía porque llega de forma asíncrona', () => {
    expect(servicio.ficha()).toBeNull()
  })
})
