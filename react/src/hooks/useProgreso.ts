// useProgreso — Sesión 43. La capa de IndexedDB (db.ts) sigue igual; el hook la ofrece a los
// componentes: el progreso por modelo, las fichas descargadas y las acciones que los cambian.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  abrirBaseDeDatos, alternarFavorito, guardarNotaDeEstudio, marcarModeloVisto,
  obtenerDescargas, obtenerTodoElProgreso, type ProgresoModelo,
} from "../db";
import { cifrarTexto, derivarClaveDesdeContrasena, descifrarTexto, obtenerOCrearSal } from "../crypto";

export function useProgreso() {
  // La base se abre UNA sola vez por montaje. Se usa useState con inicializador
  // perezoso (no useRef): el valor es estable entre renders, es seguro en
  // StrictMode —que monta dos veces en desarrollo— y, sobre todo, NO se lee un
  // ref durante el render, que es lo que prohíben las reglas de React.
  const [dbLista] = useState<Promise<IDBDatabase>>(() => abrirBaseDeDatos());
  const claveSesion = useRef<CryptoKey | null>(null);

  const [progreso, setProgreso] = useState<Map<string, ProgresoModelo>>(new Map());
  const [descargados, setDescargados] = useState<Set<string>>(new Set());

  const recargar = useCallback(async () => {
    const db = await dbLista;
    const [todo, descargas] = await Promise.all([obtenerTodoElProgreso(db), obtenerDescargas(db)]);
    setProgreso(new Map(todo.map((p) => [p.modeloId, p])));
    setDescargados(new Set(descargas.filter((d) => d.estado === "listo").map((d) => d.modeloId)));
  }, [dbLista]);

  useEffect(() => {
    // La regla react-hooks/set-state-in-effect avisa de esto, pero aquí es el
    // patrón correcto: `recargar` es async y espera a IndexedDB, así que el
    // setState ocurre en un microtask, no de forma síncrona durante el efecto.
    // No hay forma de leer IndexedDB sin actualizar estado después.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recargar();
  }, [recargar]);

  async function obtenerClave(): Promise<CryptoKey | null> {
    if (claveSesion.current) return claveSesion.current;
    const contrasena = window.prompt("Contraseña para cifrar/descifrar la nota de estudio (la misma cada vez — no se guarda en ningún lado):");
    if (!contrasena) return null;
    claveSesion.current = await derivarClaveDesdeContrasena(contrasena, obtenerOCrearSal());
    return claveSesion.current;
  }

  return {
    dbPromesa: dbLista,
    progreso,
    descargados,
    recargar,
    async marcarVisto(id: string) {
      await marcarModeloVisto(await dbLista, id);
      await recargar();
    },
    async alternarFavorito(id: string) {
      await alternarFavorito(await dbLista, id);
      await recargar();
    },
    async guardarNota(id: string, texto: string): Promise<boolean> {
      const clave = await obtenerClave();
      if (!clave) return false;
      await guardarNotaDeEstudio(await dbLista, clave, id, texto, cifrarTexto);
      await recargar();
      return true;
    },
    async verNota(id: string) {
      const p = progreso.get(id);
      if (!p?.notaCifrada || !p.notaIv) return;
      const clave = await obtenerClave();
      if (!clave) return;
      try {
        const texto = await descifrarTexto(clave, { cifrado: p.notaCifrada, iv: p.notaIv });
        window.alert(`Nota de estudio de "${id}":\n\n${texto}`);
      } catch {
        window.alert("No se pudo descifrar — la contraseña ingresada no es la correcta.");
      }
    },
  };
}
