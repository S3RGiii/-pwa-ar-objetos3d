// Proveedores comunes a todas las pruebas de la versión Angular.
// El builder de pruebas de Angular 22 carga este archivo antes de cada .spec.ts.
import { provideZonelessChangeDetection } from '@angular/core'
import type { EnvironmentProviders, Provider } from '@angular/core'

const proveedores: Array<Provider | EnvironmentProviders> = [
  // La app es zoneless (Angular 22, sin zone.js): las pruebas tienen que usar el
  // mismo modo. Con zone.js la detección de cambios vendría de otra vía y los
  // tests podrían pasar sin que la pantalla se hubiera actualizado de verdad.
  provideZonelessChangeDetection(),
]

export default proveedores
