# Sesión 42 · Actividad 1 y 2: medición con Lighthouse

> Electiva - PWA · UPTC · Sergio Nicolas Ruiz Pinzon (202212598)
>
> Proyecto medido: **Atlas 3D** — <https://s3rgiii.github.io/-pwa-ar-objetos3d/>
> Herramienta: Lighthouse 13, configuración por defecto (móvil, throttling simulado).
> Chrome headless, renderizado por software (sin GPU). Todas las corridas se hicieron
> desde el mismo equipo y en las mismas condiciones.

---

## Actividad 1 · Tres corridas y la mediana

### Línea base (antes de tocar nada)

| Corrida | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 74 | 100 | 100 | 100 | 1263 ms | 1849 ms | 1425 ms | 0 |
| 2 | 77 | 100 | 100 | 100 | 780 ms | 1806 ms | 1036 ms | 0 |
| 3 | 80 | 100 | 100 | 100 | 1002 ms | 1798 ms | 834 ms | 0 |
| **Mediana** | **77** | **100** | **100** | **100** | **1002 ms** | **1806 ms** | **1036 ms** | **0** |

### Los dos hallazgos con más impacto

**1. `forced-reflow` — 62,6 ms de reflow sin atribuir.**

Es el mayor bloque de tiempo del informe y aparece en las tres corridas. La causa
está en `src/visor.ts`: `crearVisor()` llamaba a `ajustarTamano()` en el mismo
instante en que se creaba, y esa función lee `contenedor.clientWidth`. Leer el
ancho de un elemento **antes** de que el navegador termine de calcular el diseño
lo obliga a recalcularlo de forma sincrónica, dentro de la misma tarea que está
construyendo el DOM. El navegador no puede atribuir ese trabajo a ninguna línea
concreta del script — de ahí el «[unattributed]» del informe.

**2. `unused-javascript` — 43 KiB de Three.js que no se usan en la carga inicial.**

Three.js (482 kB, el 88 % del JavaScript del sitio) se descarga entero en la
primera carga porque `main.ts` lo importa de forma estática, aunque el visor está
por debajo del pliegue. Lighthouse estima que 43,6 KiB de esos 117 KiB
comprimidos no se ejecutan nunca durante la carga. **No lo arreglé**: la solución
es una importación dinámica del visor, y eso cambia el orden de arranque de la
app entera — demasiado para la regla de «un cambio, una medición» de la
Actividad 2. Queda anotado como trabajo futuro.

> El resto de auditorías con margen (`total-blocking-time`, `mainthread-work-breakdown`,
> `max-potential-fid`) son consecuencia de estos dos: no son causas independientes.

---

## Actividad 2 · Un cambio, una medición

### El cambio

Uno solo, en `src/visor.ts`: el primer `ajustarTamano()` deja de ejecutarse
durante el parseo y se aplaza a `requestAnimationFrame` (esperando a `load` si el
documento aún no está completo).

```ts
// antes
ajustarTamano()
window.addEventListener('resize', ajustarTamano)

// después
if (document.readyState === 'complete') {
  requestAnimationFrame(ajustarTamano)
} else {
  window.addEventListener('load', () => requestAnimationFrame(ajustarTamano), { once: true })
}
window.addEventListener('resize', ajustarTamano)
```

No se cambió nada más: ni el CSS, ni el empaquetado, ni el Service Worker.

### Después del cambio

| Corrida | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 88 | 100 | 100 | 100 | 987 ms | 1786 ms | 468 ms | 0 |
| 2 | 89 | 100 | 100 | 100 | 892 ms | 1684 ms | 442 ms | 0 |
| 3 | 87 | 100 | 100 | 100 | 1020 ms | 1807 ms | 492 ms | 0 |
| **Mediana** | **88** | **100** | **100** | **100** | **987 ms** | **1786 ms** | **468 ms** | **0** |

### Antes / después, con la mediana

| Métrica | Antes | Después | Cambio |
| --- | --- | --- | --- |
| Rendimiento | 77 | 88 | **+11** |
| Accesibilidad | 100 | 100 | = |
| Buenas prácticas | 100 | 100 | = |
| SEO | 100 | 100 | = |
| FCP | 1002 ms | 987 ms | −15 ms |
| LCP | 1806 ms | 1786 ms | −20 ms |
| **TBT** | **1036 ms** | **468 ms** | **−568 ms (−55 %)** |
| CLS | 0 | 0 | = |

### Qué ocurrió de verdad, sin adornarlo

**El TBT bajó un 55 % y el rendimiento subió 11 puntos.** El trabajo pesado sigue
existiendo, pero deja de bloquear la tarea que construye el DOM: al aplazarlo a
un fotograma posterior, el navegador termina de pintar antes y el hilo principal
queda libre antes. Eso es lo que mide el TBT.

**El reflow, en cambio, no desapareció: pasó de 62,6 a 67,2 ms.** Es el dato
incómodo de esta medición y conviene decirlo. `ajustarTamano()` sigue leyendo
`clientWidth`, y leerlo antes de que el diseño esté calculado produce el mismo
reflow aunque se haga un fotograma después. Lo que cambió es **cuándo** ocurre
(fuera de la tarea crítica), no **cuánto** cuesta. La forma de eliminarlo de
verdad sería no leer el layout en absoluto: reservar el tamaño con CSS
(`aspect-ratio`) y que el visor se adapte al contenedor con un
`ResizeObserver`, sin consultar `clientWidth` ni en el arranque ni en el
`resize`.

**Ninguna métrica empeoró.** FCP y LCP bajaron ligeramente, aunque el cambio
no los tocaba: es la variación normal entre corridas, y por eso la guía insiste
en la mediana y no en una sola corrida.

> **¿Por qué es un error cambiar tres cosas y medir una sola vez?** Porque si el
> número mejora (o empeora) no sabes a cuál de los tres cambios atribuirlo, y no
> puedes defender la causa. Con tres cambios a la vez, la medición deja de ser un
> experimento y pasa a ser una anécdota. Aquí se cambió una línea y aun así el
> reflow no bajó: sin esa separación, habría sido imposible saber que la mejora
> del TBT venía del aplazamiento y no de una reducción real del trabajo.

---

## Cómo reproducirlo

```bash
npm install -g lighthouse          # o usar el del repo de trabajo
npm run build
npx serve dist -l 4310
npx lighthouse http://localhost:4310/ \
  --chrome-flags="--headless=new" \
  --output=html --output=json --output-path=./informe
```

Tres corridas, y la mediana de cada categoría y de FCP, LCP, TBT y CLS.

---

## Limitaciones

- **Todo se midió en Chrome headless con renderizado por software**, sin GPU. Los
  valores absolutos no son los de un teléfono de gama media real; lo que se
  compara son los cambios en las mismas condiciones.
- **La realidad aumentada no entra en Lighthouse**: ni el hit-test ni las anclas.
  Esa parte solo se valida en un Android con ARCore y HTTPS.
- **No se midió la versión React ni la Angular** en este informe; las cifras de
  este documento son de la versión sin framework, que es la publicada.
