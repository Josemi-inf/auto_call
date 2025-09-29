¡Perfecto! Ahora que necesitas una pantalla de **estadísticas de los workflows**, con datos detallados sobre las llamadas y su rendimiento, aquí tienes el prompt actualizado que incluye esta nueva pantalla:

---

**Descripción de la Aplicación:**

Queremos desarrollar una **aplicación web** para gestionar los **leads** que entran en nuestra base de datos después de realizar campañas. La aplicación debe integrar la gestión de **leads**, el historial de interacciones, y los workflows creados con **n8n**, además de proporcionar un panel de control donde se puedan visualizar errores de los workflows integrados y estadísticas sobre las llamadas realizadas en los workflows.

### Requerimientos para el Frontend:

1. **Pantalla de Lead (Historial):**

   * Información básica del lead: nombre, correo, teléfono, concesionario y marca asociada.
   * **Historial de mensajes**: mostrar las conversaciones previas con el lead (WhatsApp, llamadas, etc.).
   * Mostrar las **acciones realizadas** con el lead (estado, fecha y tipo de acción).
   * **Botones de acción**: "Llamar", "Escalar", "Cambiar estado", etc.
   * Un diseño limpio, con tarjetas o bloques que muestren la información de manera clara, usando una paleta neutra de colores y espacio generoso para evitar la saturación.

2. **Pantalla para Gestiónar Workflows (con n8n):**

   * Visualizar los workflows activos y su estado (ejecución, pausado, etc.).
   * Mostrar una lista de leads asociados a cada workflow.
   * Acciones de **gestión de workflows**: añadir, editar, eliminar workflows.
   * Diagrama visual del flujo del workflow (similar a la interfaz de n8n), con las etapas y acciones que atraviesa cada lead.
   * Opciones de interacción directa con los workflows (ejecutar, pausar, reanudar).

3. **Panel de Errores de Workflows:**

   * Un **panel de errores** ubicado en la barra lateral o en la parte superior del dashboard para mostrar los errores de todos los workflows integrados.
   * **Visualización de errores**: cada error debe tener un título, una breve descripción, y un estado (pendiente, resuelto).
   * Posibilidad de **filtrar los errores** por tipo (técnico, datos faltantes, conexión fallida) y gravedad (crítico, advertencia, menor).
   * **Acciones recomendadas**: junto a cada error, se deben mostrar acciones que el usuario puede tomar (Reintentar, Ver detalles, Revisar configuración).
   * Colores e iconos para indicar la gravedad del error: rojo para errores críticos, amarillo para advertencias, verde para errores resueltos.
   * Posibilidad de ver **detalles completos del error** al hacer clic sobre cada entrada.

4. **Pantalla de Estadísticas de Workflows:**

   * Esta pantalla debe mostrar estadísticas detalladas de las llamadas realizadas dentro de los workflows, con los siguientes puntos clave:

     * **Número total de llamadas realizadas**: Muestra la cantidad total de llamadas realizadas.
     * **Número de llamadas exitosas**: Número de llamadas en las que el lead atendió y la llamada fue exitosa.
     * **Número de llamadas erróneas**: Número de llamadas que no fueron atendidas o fallaron por algún motivo.
     * **Gasto de la llamada**: Mostrará el costo asociado a cada llamada realizada, basado en la duración y la tarifa de la llamada (este dato dependerá de cómo se gestiona el gasto de las llamadas).
     * **Duración total de las llamadas**: La duración combinada de todas las llamadas realizadas en un período específico.
     * **Latencia de la llamada**: Promedio de tiempo de espera entre la llamada realizada y la respuesta del lead (si aplica).
     * **Promedio de todos los valores**: Media de las estadísticas anteriores, mostrando el rendimiento promedio de las llamadas y su efectividad.

   * **Visualización**: Las estadísticas pueden ser presentadas de manera gráfica y numérica. Las gráficas de barras o líneas pueden ser útiles para mostrar la evolución de llamadas exitosas y erróneas a lo largo del tiempo.

   * **Filtros**: Los usuarios deben poder filtrar las estadísticas por **fecha** (diarias, semanales, mensuales) y por **workflow** (si están asociados a varios workflows diferentes).

   * **Detalles adicionales**: Al hacer clic en cualquier sección, se podrá ver un desglose más detallado de las llamadas (por ejemplo, lista de llamadas exitosas y erróneas, duración individual de las llamadas, latencia, etc.).

### Requerimientos Técnicos:

* **Frontend Frameworks**: React.js para la interacción dinámica y TailwindCSS para un diseño limpio y minimalista.
* **Backend**: API en Node.js o Python (Flask/Django) que interactúe con una base de datos **PostgreSQL**.
* **Integración con n8n**: A través de la API de n8n para gestionar los workflows (crear, editar, ejecutar workflows) y mostrar su estado en el frontend.
* **Base de Datos**: PostgreSQL con las siguientes tablas:

  * **leads**: información básica del lead.
  * **concesionarios** y **marcas**: relación con los concesionarios y marcas asociadas a cada lead.
  * **lead\_concesionario\_marca**: tabla de acciones entre leads y concesionarios/marcas.
  * **lead\_messages**: para almacenar los mensajes de las conversaciones.
  * **conversaciones**: información adicional sobre las interacciones.
  * **workflow\_leads**: para gestionar los leads dentro de los workflows.
  * **llamadas**: para almacenar detalles sobre cada llamada realizada (duración, gasto, latencia, éxito/errores).

### Estilo y Diseño:

* El diseño debe ser **limpio y minimalista** con **espaciado amplio** y una tipografía clara y legible.
* Uso de **tarjetas** o **bloques** para mostrar los datos de los leads y los mensajes.
* Uso de **colores sutiles** con énfasis en los estados de los leads (pendiente, en progreso, convertido, etc.).
* El panel de errores debe ser visualmente distinto y notoriamente visible sin saturar el resto de la interfaz.
* Las gráficas deben ser sencillas, con colores suaves y fáciles de interpretar.

---

**Objetivo del Proyecto:**
Crear una aplicación web que gestione leads, muestre su historial y las interacciones previas, integre los workflows de **n8n**, y proporcione un panel de estadísticas de llamadas con métricas clave como llamadas exitosas, erróneas, duración, latencia y gasto. Además, debe incluir un panel de errores para poder detectar y solucionar problemas de los workflows integrados.

---

Si tienes alguna duda adicional sobre lo que se debe incluir o necesitas más detalles sobre el diseño, no dudes en comentarlo.

---

Este prompt ahora refleja todos los elementos necesarios, incluida la pantalla de **estadísticas de llamadas** y su integración en la aplicación.

---

## Instalación y ejecución (npm)

- Requisitos: Node.js 18+ y npm.
- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev` y abrir `http://localhost:8080`
- Build producción: `npm run build`
- Preview: `npm run preview` (sirve en `http://localhost:4173`)

Nota: El proyecto usa npm como gestor. Se ignoran `bun.lockb`, `pnpm-lock.yaml` y `yarn.lock` para evitar mezclar lockfiles.
