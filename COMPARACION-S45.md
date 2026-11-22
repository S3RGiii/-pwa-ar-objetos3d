# Comparación y cierre del Sub-bloque B (Sesión 45)

> Electiva - PWA · UPTC · Sergio Nicolas Ruiz Pinzon (202212598)
> Medición propia sobre este repositorio. Todas las cifras salen de
> ejecutar la lista de verificación de la Sesión 45 (`checklist-atlas.js`,
> Chromium real) y el build de cada versión en este equipo.

## 1. Qué se comparó, y con qué reglas

Tres versiones del **mismo** Atlas 3D:

| Versión | Carpeta | Stack | Estado |
| --- | --- | --- | --- |
| Sin framework | raíz del repo | Vite + TypeScript + Three.js | Sesiones 27-42 |
| React | `react/` | Vite + React + TypeScript + Three.js | Sesión 43 |
| Angular | `angular/` | Angular 22 + TypeScript + Three.js | Sesión 44 |

Regla de la comparación: **solo lo que se ve desde fuera**. La lista de
13 puntos abre la versión compilada en un Chromium real y comprueba
idioma y documento, manifest e instalabilidad preguntándole a Chrome,
Service Worker y precaché, apertura con el servidor caído, CLS, dibujo
bajo demanda y una nota que no debe perderse. No toca código interno,
así que sirve igual para las tres.

## 2. La misma lista sobre las tres versiones

| # | Punto | Sin framework | React | Angular |
| --- | --- | --- | --- | --- |
| 1 | documento (lang, viewport, description, un `<main>`, contexto seguro) | ✅ | ✅ | ✅ |
| 2 | manifest sin errores de Chrome | ✅ | ✅ | ✅ |
| 3 | sin errores de instalabilidad | ✅ | ✅ | ✅ |
| 4 | SW activo, controlando y con precaché | ✅ | ✅ | ✅ |
| 5 | abre con el servidor caído | ✅ | ✅ | ✅ |
| 6 | CLS < 0,1 | ✅ 0,052 | ✅ 0,008 | ✅ 0,001 |
| 7 | una escena quieta no dibuja | ✅ | ✅ | ✅ |
| 8 | girar dibuja | ✅ | ✅ | ✅ |
| 9 | tras la inercia vuelve a quedarse quieta | ✅ | ✅ | ✅ |
| 10 | elegir una pieza redibuja | ✅ | ✅ | ✅ |
| 11 | cambiar de modelo redibuja | ✅ | ✅ | ✅ |
| 12 | redimensionar redibuja | ✅ | ✅ | ✅ |
| 13 | la nota no se pierde al marcar un favorito en otra tarjeta | ❌ | ✅ | ✅ |
| | **Resultado** | **12/13** | **13/13** | **13/13** |

El punto 13 falla **a propósito** en la versión sin framework: es el
defecto documentado de la Sesión 42. Se deja sin arreglar para poder
medir la diferencia, que es justo lo que pide esta sesión.

## 3. Las cifras, juntas

| Métrica | Sin framework | React | Angular |
| --- | --- | --- | --- |
| Entradas de precaché | 9 | 10 | 9 |
| Peso del precaché | 558,82 KiB | 996,50 KiB | 754,18 KiB |
| JS de framework (sin comprimir) | — | 221,71 kB | ~222 kB main |
| Bundle inicial | 62,57 kB (20,50 kB gzip) | — | 232,36 kB (65,73 kB transferido) |
| Three.js | 482,73 kB (122,01 kB gzip) | — | 528,26 kB en chunk diferido (110,71 kB transferido) |
| CLS al cargar | 0,052 | 0,008 | 0,001 |
| Lista de 13 puntos | 12/13 | 13/13 | 13/13 |

## 4. Lo que cada versión enseñó

**Sin framework.** Es la más liviana en bytes y la que menos precaché
necesita, pero concentra toda la interfaz en un `main.ts` que crece sin
freno y usa el DOM como almacén de estado. De ahí sale el fallo del
punto 13: la nota vive en un `<input>` y cualquier repintado de la lista
la borra. Nada de eso lo detecta el build; lo detecta la prueba.

**React.** Sube el precaché casi al doble, pero baja el CLS ocho veces y
elimina el defecto del punto 13 sin escribir código defensivo: el estado
de las notas deja de ser el DOM. Los hooks dejan la lógica sin pantalla
(`usePanel`, `useSensores`, `useAR`…) y la frontera con Three.js queda
explícita en el efecto de montaje y su limpieza.

**Angular.** Precaché intermedio y el mejor CLS de las tres (0,001). El
reparto del bundle es el más honesto: inicial pequeño y el visor en un
chunk diferido. Los servicios con señales dan el mismo efecto que los
hooks de React. Coste real: la cadena de build es más larga (`ng build` +
`tsc` del SW + empaquetado del SW) y **exige Node ≥ 24.15.0**; con
24.14.0 el CLI se niega a arrancar.

## 5. Cómo decidir: preguntas, no recetas

1. ¿Cuánto pesa el framework frente a lo que aporta? Aquí React y
   Angular suman entre 200 y 400 kB de precaché para resolver un defecto
   de estado que también se podría arreglar a mano en la versión sin
   framework.
2. ¿Quién mantiene la interfaz? Con muchas pantallas y varias personas,
   los componentes y los hooks/servicios se pagan solos.
3. ¿Cuánto importa el primer render? El CLS mejora de 0,052 a 0,001,
   pero el arranque de Angular es más pesado en el hilo principal.
4. ¿Qué restricciones tiene el equipo? Node 24.15.0 para Angular es un
   requisito duro, no una preferencia.

**Decisión para este proyecto:** la versión **sin framework** es la que
se entrega, porque el objetivo del Atlas es didáctico y el peso del
framework no compra nada que la prueba del punto 13 no arregle con menos
código. Las versiones React y Angular quedan en el repo como evidencia
de la comparación y se pueden publicar por separado.

## 6. Lo que estas cifras no pueden decir

- **La realidad aumentada no se probó en un teléfono con ARCore.** Todo
  se midió en Chromium de escritorio con renderizado por software. El
  hit-test, las anclas y los gestos con el overlay DOM solo se validan en
  un dispositivo real con HTTPS.
- **Lighthouse no se corrió aquí.** Las cifras de este documento son del
  build y de la lista de 13 puntos, no de un informe Lighthouse. Las
  medianas que cita la guía (S42: 83 de rendimiento, S43: 91) son del
  material del curso, no de este equipo.
- **La mediana no se calculó.** Cada cifra de CLS y de precaché es una
  corrida. Las mediciones de rendimiento varían entre corridas; para una
  decisión fina habría que repetir tres o cinco veces y quedarse con la
  mediana.
- **No se midió en móvil de gama media** ni con throttling de red. El
  precaché pesa casi 1 MiB en React: con red móvil lenta eso se nota.
- **La batería y el consumo de GPU no se midieron**, aunque el dibujo
  bajo demanda (punto 7) es precisamente lo que debería mejorarlos.
