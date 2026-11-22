# Atlas 3D de Arquitectura de Software

PWA que dibuja tres modelos de arquitectura de software con Three.js y los
apoya en una superficie real con realidad aumentada. Cada modelo se describe
con **datos** (piezas y enlaces) y un constructor genérico los convierte en
mallas, flechas y rótulos: no hay archivos `.glb`.

**Electiva - PWA · UPTC · Sub-bloque B (Sesiones 27-45)**
Sergio Nicolas Ruiz Pinzon — 202212598

---

## Las tres versiones

El repositorio conserva las tres implementaciones del mismo producto, que es
lo que compara la Sesión 45:

| Versión | Carpeta | Stack | Sesiones |
| --- | --- | --- | --- |
| Sin framework | raíz (`.`) | Vite + TypeScript + Three.js | 27-42 |
| React | `react/` | Vite + React + TypeScript | 43 |
| Angular | `angular/` | Angular 22 + TypeScript | 44 |

La comparación medida está en [`COMPARACION-S45.md`](./COMPARACION-S45.md).

---

## Versión publicada

La versión **sin framework** (raíz) es la que se despliega en GitHub Pages.
El flujo `.github/workflows/pages.yml` compila con
`--base=/${nombre-del-repo}/` y publica `dist/`.

```text
https://s3rgiii.github.io/-pwa-ar-objetos3d/
```

Para probar otra versión en local, cada carpeta tiene su propio `package.json`.

---

## Qué hace la aplicación

- **Tres modelos de arquitectura**: patrón MVC, arquitectura en capas y
  microservicios.
- **Visor 3D** con Three.js: girar, hacer zoom y elegir una pieza para leer
  qué hace.
- **Realidad aumentada** con WebXR `immersive-ar`: hit-test, retícula, anclas
  y colocación sobre una superficie real.
- **Sensores**: rotar el visor inclinando el teléfono, con calibración.
- **Cámara** como fondo del visor.
- **Sin conexión**: Service Worker propio (`injectManifest`) con precaché y
  estrategias por tipo de recurso; las fichas de los modelos se descargan para
  usarlas offline.
- **IndexedDB** para el progreso, los favoritos y las notas, con migración
  versionada; **Web Crypto** (PBKDF2 + AES-GCM) para la nota privada.
- **Instalación guiada** con `beforeinstallprompt`, estados de instalación
  (incluido iOS) y aviso de conexión.

---

## Cómo ejecutar

Requiere Node 18 o superior.

```bash
npm install
npm run dev        # desarrollo
npm run build      # compila la app y el Service Worker
npm run preview    # sirve dist/ en http://localhost:4173
```

En las carpetas `react/` y `angular/` los comandos son los mismos, salvo que
**Angular exige Node ≥ 24.15.0** (el CLI se niega a arrancar con versiones
anteriores).

La cámara, el micrófono y la realidad aumentada requieren `https` o
`localhost`.

---

## Verificación

La lista de la Sesión 45 abre la versión compilada en un Chromium real y
comprueba 13 puntos (documento, manifest e instalabilidad, Service Worker y
precaché, apertura sin servidor, CLS, dibujo bajo demanda y una nota que no se
debe perder).

| Versión | Resultado | CLS | Precaché |
| --- | --- | --- | --- |
| Sin framework | 12/13 | 0,052 | 9 entradas · 558,82 KiB |
| React | 13/13 | 0,008 | 10 entradas · 996,50 KiB |
| Angular | 13/13 | 0,001 | 9 entradas · 754,18 KiB |

El punto 13 falla **a propósito** en la versión sin framework: es el defecto
documentado de la Sesión 42 y se conserva para poder medir la diferencia con
las otras dos.

---

## Estructura

```text
.
├─ src/                  # app sin framework (S27-42)
│  ├─ modelos/           # los tres modelos como datos + constructor genérico
│  ├─ visor.ts           # escena Three.js con dibujo bajo demanda
│  ├─ xr.ts              # WebXR immersive-ar: soporte, sesión, errores
│  ├─ sw.ts              # Service Worker propio (injectManifest)
│  ├─ db.ts              # IndexedDB versionada
│  ├─ crypto.ts          # PBKDF2 + AES-GCM
│  ├─ sensores.ts        # orientación del dispositivo
│  ├─ camara.ts          # cámara trasera como fondo
│  ├─ instalar.ts        # beforeinstallprompt y estados
│  ├─ conexion.ts        # aviso de conexión
│  └─ descargas.ts       # cola de descargas de fichas
├─ public/
│  ├─ manifest.json
│  ├─ iconos/
│  └─ modelos/           # fichas JSON de los tres modelos
├─ react/                # versión con React (S43)
├─ angular/              # versión con Angular (S44)
├─ COMPARACION-S45.md    # comparación medida de las tres versiones
└─ .github/workflows/    # publicación en GitHub Pages
```

---

## Limitaciones

- **Realidad aumentada**: no funciona en iPhone (Safari no ofrece WebXR
  `immersive-ar`). En escritorio hace falta el *Immersive Web Emulator*, y sin
  overlay DOM no llegan los gestos con los dedos. La prueba real es un Android
  con ARCore sirviendo por HTTPS.
- **Los modelos son esquemas didácticos**: cajas, cilindros y flechas, no
  réplicas realistas.
- **Las cifras de CLS y precaché son de una corrida** en este equipo, no una
  mediana de varias. Lighthouse no se ejecutó aquí.
- **No hay servidor**: los avisos son locales y la descarga de fichas usa
  Background Sync sin backend.

---

*Electiva - PWA · Facultad de Ingeniería · UPTC*
