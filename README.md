# CoachApp — Frontend (Next.js)

Documentación del **frontend** del MVP. Contexto del monorepo, backend y despliegue: [**README raíz**](../README.md).

---

## Alcance del MVP (tres pilares)

Este frontend prioriza tres capacidades que deben funcionar **de forma correcta y predecible**:

| Pilar | Rol | Qué cubre en la app |
|-------|-----|---------------------|
| **1. Coach: rutina + historial** | Entrenador autenticado | Editar rutinas por día (ejercicios, series, rangos, notas), reordenar días/ejercicios, y **ver el último resultado guardado por ejercicio** como referencia al planificar. |
| **2. Atleta: sesión + guardado** | Atleta con enlace `/athlete/[id]` | Ejecutar el día elegido, cargar peso/reps desde **historial reciente**, registrar la sesión en memoria y **persistir en servidor con `exerciseId`** para que cada resultado quede ligado al ejercicio correcto. |
| **3. Autenticación del coach** | Solo el entrenador inicia sesión | Login/registro, cookie JWT HTTP-only, rutas de dashboard protegidas y comprobación de sesión antes de mostrar el panel. |

Todo lo demás (PWA, WhatsApp, pagos en UI) **apoya** estos pilares pero no los redefine.

---

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (`useAthleteStore`, `useAthleteSessionStore`)
- **SWR** + funciones `fetch` en `src/app/api/*` con `credentials: "include"`
- **PWA**: `public/manifest.json`, `public/sw.js`, componente de instalación

---

## Estructura de carpetas (resumen)

```
frontend/
├── src/app/
│   ├── page.tsx                 # Landing
│   ├── auth/login|register/     # Solo coach
│   ├── dashboard/               # Panel coach (layout con AuthGate)
│   │   ├── page.tsx             # Lista de atletas
│   │   └── athlete/[id]/        # Detalle, rutina, pagos, dieta
│   └── athlete/[id]/            # Vista atleta (sin AuthGate de coach)
│       ├── layout.tsx           # Carga atleta + cache localStorage
│       ├── page.tsx             # Días de rutina → iniciar sesión
│       └── session/[indexDay]/  # Sesión en vivo (índice de día en URL = 1-based)
├── src/app/api/                 # Cliente HTTP hacia el backend
├── src/components/
│   ├── auth/AuthGate.tsx
│   ├── layout/Header/
│   ├── reusable/editRoutineSection/  # Edición de rutina (coach)
│   └── loading/                 # Skeletons
├── src/hooks/                   # useAuthStatus, useGetAthleteInfo, etc.
├── src/store/
└── src/config/env.ts            # requireApiUrl()
├── public/sw.js
└── README_SESSION.md            # Detalle histórico rutina/sesión (referencia)
```

---

## Pilar 3 — Autenticación del coach

### Comportamiento

1. **`/auth/login`** y **`/auth/register`** llaman a `src/app/api/auth.ts` → backend `/api/auth/login` y `/api/auth/register`.
2. Respuesta exitosa de login: el backend envía cookie **`token`** (JWT, `httpOnly`; en producción `Secure` + `SameSite` según entorno).
3. Todas las peticiones del dashboard usan **`fetch(..., { credentials: "include" })`** para adjuntar la cookie.
4. **`useAuthStatus`** (`src/hooks/useAuthStatus.ts`) consulta **`GET /api/auth/isAuthenticated`** y expone `loading | authenticated | unauthenticated`.
5. **`AuthGate`** (`src/components/auth/AuthGate.tsx`):
   - En **`dashboard/layout.tsx`** con `mode="require-auth"`: si no hay sesión, redirige a `/auth/login` y evita flash de contenido (`null` mientras `loading`).
   - En páginas de auth con `mode="redirect-if-auth"`: si ya hay sesión, envía al dashboard.

### Variables de entorno

- **`NEXT_PUBLIC_API_URL`**: base del backend (obligatoria para llamadas; falla explícita vía `requireApiUrl()` en `src/config/env.ts`).
- **`NEXT_PUBLIC_APP_URL`**: URL pública del frontend para enlaces compartidos (WhatsApp, etc.).

### Rutas protegidas vs públicas

| Área | Rutas | Protección |
|------|--------|------------|
| Coach | `/dashboard/*` | `AuthGate` + cookie |
| Auth | `/auth/*` | Formularios; redirect si ya logueado |
| Atleta | `/athlete/*` | Sin login de coach; acceso por enlace con `id` de atleta |

---

## Pilar 1 — Edición de rutina e historial (coach)

### Dónde ocurre

- **Lista**: `/dashboard` — `DashboardHeader` + `SearchInput` + **`AthleteGrid`** (`AthleteCard`, enlace a detalle, `SendWppRutine`).
- **Detalle**: `/dashboard/athlete/[id]` — datos vía **`useGetAthleteInfo`** → `GET /api/coach/getAthleteInfo/:id` (incluye rutina transformada con historial por ejercicio).
- **Editor**: **`RoutineEditorCard`** → **`EditRoutineSection`** (`components/reusable/editRoutineSection/`).

### Componentes clave

| Componente | Función |
|------------|---------|
| **`EditRoutineSection`** | Día activo, drag-and-drop de ejercicios (`@dnd-kit`), persistencia con **`updateRoutine`** solo si la respuesta es OK. |
| **`SelectDay`** | Alta/baja/reorden de días (diálogo “Configurar días”). |
| **`ExerciseCard`** | Muestra nombre, series, rangos, notas; **última sesión** desde `exercise.exerciseHistory` (último elemento si existe); edición en **`DialogExerciseCard`**; borrado con confirmación y sync al backend cuando la rutina ya existe. |
| **`AthleteNotesEdit`** | Notas del atleta visibles/editables según flujo del padre. |

### Persistencia de la rutina

- **`POST /api/protected/updateRoutine`** con cookie del coach (`authMiddleware` en backend).
- Payload: `idAthlete` + matriz `routine[día][ejercicio]` con campos de ejercicio (nombre, sets, rangos, notas).
- El servidor alinea cambios **por posición dentro de cada día** al actualizar filas existentes; los ejercicios tienen **`id`** en BD, por lo que **el historial ligado al `exerciseId` se conserva** cuando solo cambian nombre/datos sin borrar la fila.
- Eliminar un ejercicio puede eliminar su historial en cascada (comportamiento de BD); el coach debe asumir esa pérdida al borrar filas.

### Visualización de historial

En **ExerciseCard**, el bloque de historial usa el último registro en **`exercise.exerciseHistory`** (el API devuelve al menos el más reciente por ejercicio). Así el coach **decide carga basándose en la última sesión guardada por el atleta** (pilar 2).

---

## Pilar 2 — Ejecución de sesión y guardado óptimo (atleta)

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/athlete/[id]` | Resumen del atleta, selector de día, lista de ejercicios del día; botón **Empezar entrenamiento**. |
| `/athlete/[id]/session/[indexDay]` | **`indexDay` en la URL es 1-based** (día 1 → `/session/1`). Internamente se usa índice 0-based para la rutina. |

### Carga de datos

- **`layout.tsx`**: hidrata **`useAthleteStore`** desde `localStorage` si el `id` coincide; si no, **`getAthleteById`** → `GET /api/athletes/:id`. Skeleton / error / reintentar.
- La respuesta incluye rutina con, por ejercicio, **`id`** y **`exerciseHistory`** (último bloque útil para inicializar sets/peso).

### Estado en cliente — `useAthleteSessionStore`

- **`initSession(dayIndex, exerciseDefs)`**: construye una fila por ejercicio con **`exerciseId`** obligatorio (solo ejercicios con `id` válido del API), fecha del día, peso y reps iniciales desde historial o rango mínimo.
- Durante la sesión: **`setReps`**, **`setWeight`**, **`updateAthleteNotes`**, **`nextExercise`**, **`prevExercise`**.
- **`finalizeSession()`**: devuelve snapshot `{ dayIndex, date, sessionProgress }` donde cada elemento cumple **`SessionProgressEntryDTO`** (`@coachapp/shared`): **`exerciseId`**, `date`, `weight`, `sets[]`, `athleteNotes` opcional.

### Guardado en servidor

- **`saveSession`** en `src/app/api/athlete.ts` → **`POST /api/athletes/saveSession`** con `{ id, dayIndex, sessionProgress }`.
- El backend **exige `exerciseId` en cada entrada** y comprueba que pertenezcan al día; así el resultado **no depende solo del orden en pantalla** si la rutina cambió antes de cerrar la sesión de forma inconsistente (respuesta 400 con código tipo `SESSION_EXERCISE_MISMATCH` si no cuadra).
- Tras guardar OK, la página de sesión **vuelve a pedir el atleta** y actualiza store + `localStorage` para que coach y atleta vean historial actualizado.

### Pagos (soft gate)

- **`checkPaymentStatus`** (`src/lib/paymentUtils.ts`) puede bloquear vista de rutina/sesión si `paymentDate` indica mora fuera de ventana; es regla de UI del MVP, no pasarela de pago.

### UI de sesión

- **`ExerciseView`**, **`ExerciseWeight`**, **`SetCard`**, **`AthleteNotes`**, etc. bajo `session/[indexDay]/sessionComponents/`.

---

## Otros conceptos transversales

### PWA

- **`sw.js`**: solo cache **GET same-origin**; **no** cachea `/api/*` ni otros orígenes (el API del backend va directo al navegador).
- **`PWAInstaller`**: invitación a instalar la app según soporte del navegador.

### Skeletons y UX de carga

- **`AthleteHomeSkeleton`**, **`SkeletonAthleteDetail`**, grids de carga en dashboard — evitan pantallas vacías mientras llegan datos.

### Documentación ampliada

- **`README_SESSION.md`**: profundiza en el modelo mental rutina vs sesión y casos límite; si algo diverge del código, **prevalece el comportamiento del repo** y este README de tres pilares.

---

## Scripts

```bash
npm run dev          # http://localhost:3000
npm run build
npm run start
npm run test:e2e     # Playwright (smoke); ver playwright.config.ts
```

---

## Resumen

- **Coach**: se autentica con cookie, edita rutinas con feedback de **último historial por ejercicio**, y persiste con `updateRoutine`.
- **Atleta**: ejecuta sesiones con estado en Zustand y **guarda resultados por `exerciseId`** para un vínculo estable con la BD.
- **Seguridad MVP**: sesión de coach protegida por **`AuthGate`** + **`requireApiUrl`**; vista atleta por enlace con UUID.
