# Pedidos Lucciano's Europa

PWA (app web instalable) para que los **encargados de los locales** carguen sus **pedidos de insumos** desde un catálogo fijo de artículos. Funciona **offline**, sin backend ni librerías externas: todo es HTML + CSS + JavaScript vanilla en un solo `index.html`.

---

## Qué hace

- **Catálogo fijo de 360 artículos** en 28 categorías, extraídos de la hoja *Pedido actual* de la planilla. Cada artículo trae:
  - **Código estable** (ej. `CHO-018`) — siempre el mismo para ese artículo.
  - **Categoría / clasificación** (aditivos, azúcar, chocolates, etc.).
  - **Unidad de medida** predeterminada.
  - **Marca, proveedor y contacto**.
- **Pedidos como proyectos**: cada pedido es un proyecto independiente, numerado de forma **correlativa** y automática: `Pedido N° XX - DD/MM/AAAA`.
- Al crear un pedido **pide el local** (lista cerrada con los locales de Europa).
- Los artículos se **eligen de una lista desplegable con buscador** — no se puede escribir libre algo que no esté en el catálogo. Se suman **de a uno** con el botón `+` y cada uno tiene su **stepper de cantidad**.
- **Exportar a Excel**: genera un `.xlsx` con el **mismo formato de las hojas "Pedido XXX"** de la planilla (encabezado negro + columnas MATERIA PRIMA · Cantidad · Unidad · Marca · Proveedor · Contacto · Fecha). Ese archivo **se abre directo en Google Sheets** conservando el formato.
- **Enviar por mail**: comparte el Excel (en el celular usa el menú de compartir nativo → Gmail / WhatsApp / etc.) y abre un borrador de mail con el resumen del pedido.
- **Instalable y offline**: se instala como app en el celu y funciona sin internet.
- **Backup / Restaurar** (pestaña *Info*): exporta/importa todos los pedidos como JSON, por si cambiás de dispositivo.

---

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa (catálogo embebido + lógica + generador de Excel). |
| `manifest.json` | Hace que sea instalable como PWA (nombre, íconos, colores). |
| `sw.js` | Service worker: cachea la app para que funcione **offline**. |
| `Logo_app.png` | Logo de Lucciano's que se ve **dentro** de la app (header). |
| `icon-192.png` | Ícono PWA 192×192. |
| `icon-512.png` | Ícono PWA 512×512. |
| `icon-maskable-512.png` | Ícono *maskable* 512×512 (con zona segura para Android). |

> Importante: todos estos archivos tienen que estar **juntos en la misma carpeta** del repo.

---

## Cómo publicarla (GitHub Pages)

1. Creá un repositorio (ej. `pedidos-europa`) y subí **todos los archivos de esta carpeta** a la raíz.
2. En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
3. Esperá un minuto. Queda en `https://TU-USUARIO.github.io/pedidos-europa/`.
4. Abrí esa URL en el celular → menú del navegador → **"Agregar a pantalla de inicio"**.

> Como ya te pasó con *Dividir Gastos* y *Soy Bostero*: los cambios que hagas en el artifact de la conversación **no actualizan solos el deploy**. Cuando cambies algo, hay que **descargar el `index.html` nuevo y volver a subirlo** al repo.

---

## Si actualizás la app (se actualiza sola)

La app está configurada para **actualizarse sola** en los celulares ya instalados. No hace falta tocar `sw.js` ni que nadie borre datos del sitio.

Cómo funciona:

- El `index.html` (que es donde vive toda la app y el catálogo) se sirve con estrategia **network-first**: cada vez que el encargado abre la app **con internet**, el celular pide la última versión a GitHub y la muestra. **Sin internet**, usa la copia cacheada y funciona igual.
- Los íconos, el logo y el manifest usan **stale-while-revalidate**: cargan al toque desde el cache y se refrescan en segundo plano para la próxima apertura.
- Si algún día cambia el propio `sw.js`, la app **se recarga sola una vez** para tomar la versión nueva.
- Nada de esto borra el `localStorage`, así que **los pedidos guardados se mantienen**.

En la práctica: **subís el `index.html` nuevo al repo y listo.** En la próxima apertura con internet, el celular ya muestra los cambios (catálogo nuevo, ajustes, etc.).

> Recordá: los cambios que hagas en el artifact de la conversación no llegan solos al repo. Tenés que **descargar el `index.html` nuevo y subirlo** a GitHub. De ahí en adelante, la propagación a los celulares es automática.

> Solo si en el futuro cambiás la **lógica del propio `sw.js`** conviene subirle el número de versión del cache (`pedidos-luccianos-v2` → `v3`) para forzar la limpieza del cache viejo. Para cambios normales del `index.html` **no hace falta**.

---

## Notas técnicas

- **Sin dependencias**: el `.xlsx` se arma con un generador propio (ZIP método *store* + CRC32 + XML de OpenXML). Cero librerías, cero CDN, todo offline.
- **Datos locales**: los pedidos se guardan en `localStorage` del dispositivo. No hay servidor, así que cada celular tiene sus propios pedidos (para juntarlos, usá el backup JSON).
- **Barra de navegación** anclada abajo con `position:fixed; bottom:0` + `env(safe-area-inset-bottom)` (queda pegada al borde físico, sin el hueco negro del enfoque `100dvh`).
- Scroll lateral bloqueado y doble-tap-zoom desactivado para que se sienta como app nativa.

---

## Opción futura: escritura directa al Google Sheet

Hoy la app exporta un `.xlsx` que se abre como Sheet (no necesita internet). Si en algún momento querés que **escriba directo** en una planilla de Google compartida, se puede agregar un **Google Apps Script publicado como web-app**: la app le manda el pedido por `fetch` y el script lo escribe en el Sheet. Eso requiere internet y configurar el script una vez. Queda anotado como mejora.
