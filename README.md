# CoachApp Frontend

GymBro Coach es una PWA construida con Next.js que permite a entrenadores gestionar atletas, rutinas y sesiones sin fricción. El objetivo del frontend es ofrecer una experiencia dual:

- **Entrenadores**: dashboard para administrar atletas, generar rutinas, compartirlas por WhatsApp y revisar progreso/pagos.
- **Atletas**: interfaz móvil donde ejecutan sesiones, registran peso/repeticiones y dejan notas en tiempo real.

## Stack principal
- **Next.js (App Router, TypeScript, React Server Components)**
- **TailwindCSS + shadcn/ui** para el sistema de diseño
- **Zustand** para estado del atleta y de las sesiones
- **SWR/Fetch** mediante wrappers en `src/app/api`
- **PWA** (manifest, service worker, instalación desde navegador)

## Arquitectura de carpetas
```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                # Landing/marketing
│  │  ├─ auth/                   # Auth de entrenador (login/register)
│  │  ├─ dashboard/              # Panel del entrenador
│  │  └─ athlete/[id]/...        # Experiencia del atleta
│  ├─ components/
│  │  ├─ layout/                 # Header y navegación
│  │  ├─ reusable/               # Sección de edición de rutina y utilidades
│  │  └─ ui/                     # Kit shadcn (Button, Card, Dialog, etc.)
│  ├─ hooks/                     # Hooks para data fetching y middleware
│  ├─ store/                     # Estado global (Zustand)
│  └─ types/                     # Tipos TS compartidos
├─ public/
│  ├─ manifest.json              # Configuración PWA
│  └─ sw.js                      # Service Worker personalizado
└─ README_SESSION.md             # Documentación detallada del flujo de sesiones
```

## Flujo del coach
1. **Landing (`/`)**: vista marketing con CTA hacia registro/login.
2. **Autenticación (`/auth/login`, `/auth/register`)**: formularios conectados al backend mediante `app/api/auth.ts`; uso de cookies HTTP-only.
3. **Dashboard (`/dashboard`)**:
   - `SearchBar`: filtra atletas.
   - `AthleteList` + `AthleteCard`: listado responsive con acción rápida "Enviar rutina" (`SendWppRutine` usa `NEXT_PUBLIC_APP_URL`).
   - Páginas hijas como `dashboard/athlete/[id]` para detalle, historial de pagos (`PaymentSection`) y edición de datos.
4. **Edición de rutinas** (reutilizable):
   - `EditRoutineSection`: orquesta vista y acciones por día.
   - `SelectDay`: gestiona orden de días y sincroniza con backend.
   - `ExerciseCard` + `DialogExerciseCard`: CRUD de ejercicios, notas, rangos y pesos.
   - `AthleteNotesEdit`: control de feedback textual.

## Flujo del atleta
1. **`/athlete/[id]`**
   - Usa `useAthleteStore` para hidratar datos cargados previamente.
   - Selector de días con vista previa de ejercicios (`BodyWeight`, resumen de sets y rangos).
   - CTA "Empezar entrenamiento" que dirige a la sesión activa.
2. **`/athlete/[id]/session/[indexDay]`**
   - `useAthleteSessionStore` inicializa sesión con historial previo y mantiene el progreso.
   - `ExerciseView`: componente central que muestra coach notes, historial, controles de peso/reps (`ExerciseWeight`, `SetCard`) y notas del atleta (`AthleteNotes`).
   - Navegación anterior/siguiente con guardado en memoria.
   - `finalizeSession` genera snapshot y llama a `saveSession`; al guardar se refresca el `useAthleteStore` con datos del backend.

## Estado y datos
- **Zustand**:
  - `useAthleteStore`: almacena el atleta activo (id, rutina, métricas).
  - `useAthleteSessionStore`: controla meta de sesión, sets, peso, notas y exporta snapshot.
- **Hooks de datos**:
  - `useGetAllAthletes`, `useGetAthleteInfo`, `useCoachInfo`: wrappers con SWR/fetch.
  - `useMiddleware`: protege rutas privadas; redirige según autenticación proporcionada por cookie.
- **API client (`src/app/api`)**: funciones `fetch` con `credentials: include` apuntando a `NEXT_PUBLIC_API_URL`.

## Integración PWA
- `manifest.json`: define nombre, íconos y accesos directos (dashboard y rutinas).
- `sw.js`: cachea rutas estáticas y delega requests a API para evitar problemas de CORS/offline.
- Componente `PWAInstaller`: muestra prompt de instalación (ubicado en `src/components/PWAInstaller.tsx`).

## Variables de entorno relevantes
- `NEXT_PUBLIC_API_URL`: URL del backend (Render/Vercel).
- `NEXT_PUBLIC_APP_URL`: URL pública usada en links compartidos (WhatsApp).

## Scripts útiles
```bash
npm run dev        # Desarrollo local  http://localhost:3000
npm run build      # Build productivo
npm run start      # Servidor Next en modo producción
```

## Flujos destacables
- **Generación y envío de rutinas**: desde dashboard → edición (`EditRoutineSection`) → compartir via `SendWppRutine`.
- **Ejecución de sesión**: selección de día → sesión con feedback → snapshot enviado al backend → refresco de dashboard.
- **Protección de rutas**: `useMiddleware` se ejecuta en páginas sensibles (auth vs dashboard) para asegurar sesión válida.

---

## 📝 Sistema de Edición de Rutinas

### Arquitectura

El sistema de edición de rutinas permite al entrenador crear, modificar y reordenar ejercicios por día de la semana. Utiliza **drag and drop** con `@dnd-kit` para una experiencia fluida en desktop y móvil.

### Componentes principales

#### 1. **EditRoutineSection** (`components/reusable/editRoutineSection/EditRoutineSection.tsx`)
- **Función**: Orquesta la edición completa de rutinas
- **Estado**: Maneja el día seleccionado y el estado de carga durante reordenamiento
- **Drag and Drop**: Implementado con `@dnd-kit` para reordenar ejercicios
- **Actualización**: Solo actualiza el estado cuando la request da 200 (no optimistic updates)

#### 2. **SelectDay** (`components/reusable/editRoutineSection/SelectDay.tsx`)
- **Función**: Gestiona días de la rutina (agregar, eliminar, reordenar)
- **Vista**: Chips horizontales con preview de ejercicios
- **Dialog**: "Configurar días" permite reordenar, agregar y eliminar días
- **Drag and Drop**: Reordenamiento de días con `@dnd-kit`
- **Animación**: Efecto `animate-day-bump` al mover días

#### 3. **ExerciseCard** + **DialogExerciseCard**
- **ExerciseCard**: Vista de ejercicio con información (series, rangos, notas, historial)
- **DialogExerciseCard**: Formulario para crear/editar ejercicios
- **Campos editables**: Nombre, series, rango min/max, notas del coach

### Flujo de actualización

```
1. Usuario edita rutina (agrega/elimina/reordena ejercicios o días)
   ↓
2. Se calcula el nuevo estado pero NO se actualiza aún
   ↓
3. Se muestra estado de carga (isReorderingExercises/isReorderingDays)
   ↓
4. Se envía request a POST /api/protected/updateRoutine
   ↓
5. Backend procesa en transacción:
   - Actualiza ejercicios existentes por posición
   - Crea nuevos ejercicios
   - Elimina ejercicios que ya no existen
   - Preserva historial de ejercicios existentes
   ↓
6. Si response.ok === 200:
   - Se actualiza el estado local
   - Se refresca la UI
   ↓
7. Si falla:
   - No se actualiza el estado
   - Se muestra error en consola
```

### Formato de datos

**Frontend → Backend** (`POST /api/protected/updateRoutine`):
```typescript
{
  idAthlete: string,
  routine: [
    [ // Día 0
      {
        exercise: string,      // Nombre del ejercicio
        sets: number,           // Cantidad de series
        rangeMin: number,       // Reps mínimas
        rangeMax: number,       // Reps máximas
        coachNotes: string,     // Notas del entrenador
        athleteNotes: string    // Notas del atleta
      },
      // ... más ejercicios
    ],
    // ... más días
  ]
}
```

**Backend procesa** (`protected.ts:updateRoutine`):
- Identifica ejercicios por **posición/índice** (no por ID)
- Actualiza ejercicios existentes en la misma posición
- Crea nuevos ejercicios si hay más en el array
- Elimina ejercicios que ya no existen en el array
- **Preserva el historial** de ejercicios que se actualizan (porque el `exerciseId` se mantiene)

### Problemas y limitaciones

#### ⚠️ Identificación por posición (no por ID)

Los ejercicios se identifican por su **posición en el array**, no por un ID único. Esto causa:

1. **Reordenamiento de ejercicios**:
   - Si el entrenador mueve un ejercicio de posición 0 a posición 2
   - El backend actualiza el ejercicio en posición 0 con los datos del nuevo ejercicio
   - El historial puede asociarse incorrectamente si no se maneja bien

2. **Eliminación de ejercicios**:
   - Si se elimina un ejercicio en medio del array
   - Todos los ejercicios siguientes se desplazan
   - El backend actualiza ejercicios por posición, lo que puede causar que el historial se asocie al ejercicio incorrecto

3. **Cambio de nombre de ejercicio**:
   - ✅ **Funciona correctamente**: El historial se mantiene porque está vinculado por `exerciseId` en la DB
   - El `exerciseId` no cambia al actualizar el nombre
   - El historial sigue asociado al mismo ejercicio

4. **Ejercicios eliminados**:
   - ⚠️ **Pérdida de historial**: Si se elimina un ejercicio, su historial se pierde por `onDelete: Cascade` en Prisma
   - El historial está vinculado por `exerciseId`, y si el ejercicio se elimina, el historial también

### Cómo funciona la actualización en el backend

```typescript
// protected.ts:updateRoutine (línea 112-143)
for (let exerciseIndex = 0; exerciseIndex < day.length; exerciseIndex++) {
  const exerciseData = day[exerciseIndex];
  const existingExercise = existingExercises[exerciseIndex]; // ← Por posición

  if (existingExercise) {
    // Actualiza el ejercicio en esa posición
    // El exerciseId se mantiene, por lo que el historial se preserva
    await tx.exercise.update({
      where: { id: existingExercise.id },
      data: { exercise: exerciseData.exercise, ... }
    });
  } else {
    // Crea nuevo ejercicio si no existe en esa posición
    await tx.exercise.create({ ... });
  }
}

// Elimina ejercicios que ya no existen
if (day.length < existingExercises.length) {
  const exercisesToDelete = existingExercises.slice(day.length);
  // Elimina ejercicios y su historial (CASCADE)
}
```

---

## 🏋️ Sistema de Carga y Guardado de Sesiones

### Arquitectura

El sistema de sesiones permite al atleta ejecutar entrenamientos, registrar peso/reps y guardar su progreso. Utiliza **Zustand** para el estado de sesión y se sincroniza con el backend al finalizar.

### Flujo de carga de sesión

#### 1. **Carga inicial de datos del atleta**

**Origen**: `useAthleteStore` → `athlete.routine[indexDay]`

```typescript
// session/[indexDay]/page.tsx (línea 54)
const dayExercises = athlete.routine[indexDay] || [];
```

**Datos incluidos**:
- Ejercicios del día desde `athlete.routine[indexDay]`
- Historial previo: `exercise.exerciseHistory[0]` (último registro)
- Configuración: `sets`, `rangeMin`, `rangeMax`, `coachNotes`

**Backend carga** (`athleteController.getAthleteById`):
```typescript
// Incluye el último historial de cada ejercicio
include: {
  exercises: {
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        take: 1  // Solo el más reciente
      }
    }
  }
}
```

#### 2. **Inicialización de sesión**

**Store**: `useAthleteSessionStore.initSession()`

```typescript
// session/[indexDay]/page.tsx (línea 60-77)
const exerciseDefs: ExerciseDef[] = dayExercises.map((exercise) => {
  const lastHistory = exercise.exerciseHistory?.[0]; // Último historial
  
  return {
    setsCount: exercise.sets,
    weight: lastHistory?.weight || 0,  // Peso del historial o 0
    rangeMin: exercise.rangeMin,
    rangeMax: exercise.rangeMax,
    lastHistory,  // Historial completo para inicializar sets
  };
});

initSession(indexDay, exerciseDefs);
```

**Inicialización en el store** (`useAthleteSessionStore.ts:63-88`):
```typescript
const sessionProgress: SessionExercise[] = dayExercises.map((exercise) => {
  // Inicializa sets con valores del historial o rango mínimo
  const sets = Array(exercise.setsCount).fill(0).map((_, index) => {
    return exercise.lastHistory?.sets?.[index] ?? exercise.rangeMin ?? 0;
  });

  return {
    date: currentDate,
    weight: exercise.lastHistory?.weight ?? exercise.weight ?? 0,
    sets,
    athleteNotes: exercise.athleteNotes || "",
  };
});
```

### Actualización de valores durante la sesión

**Funciones del store**:
- `setReps(exIndex, setIndex, reps)`: Actualiza reps de un set específico
- `setWeight(exIndex, weight)`: Actualiza peso del ejercicio
- `updateAthleteNotes(exIndex, notes)`: Actualiza notas del atleta

**Estado en memoria**:
```typescript
sessionProgress: [
  {
    date: "2024-01-15",
    weight: 80.5,
    sets: [10, 10, 9],  // Array de reps por set
    athleteNotes: "Notas del atleta"
  },
  // ... más ejercicios
]
```

**Navegación**:
- `nextExercise()` / `prevExercise()`: Cambia `currentExerciseIndex`
- Todo se mantiene en memoria hasta finalizar

### Guardado de sesión

#### Formato enviado al backend

**Endpoint**: `POST /api/athletes/saveSession`

```typescript
// frontend/src/app/api/athlete.ts (línea 29)
{
  id: string,              // ID del atleta
  dayIndex: number,        // Índice del día (0-based)
  sessionProgress: [       // Array de ejercicios de la sesión
    {
      date: string,        // "2024-01-15"
      weight: number,      // 80.5
      sets: number[],      // [10, 10, 9]
      athleteNotes?: string
    },
    // ... más ejercicios (uno por cada ejercicio del día)
  ]
}
```

#### Procesamiento en el backend

**Controlador**: `athleteController.saveSession` (línea 109-252)

**Paso 1**: Validación y búsqueda
```typescript
const athlete = await prisma.athlete.findUnique({
  where: { id },
  include: {
    routine: {
      where: { dayIndex },
      include: { exercises: true }
    }
  }
});
```

**Paso 2**: Transacción que crea múltiples registros

1. **Session** (registro de la sesión completa):
   ```typescript
   {
     athleteId: id,
     dayIndex: dayIndex,
     date: "2024-01-15"
   }
   ```

2. **SessionExercise** (cada ejercicio de la sesión):
   ```typescript
   // Se identifica el ejercicio por POSICIÓN en el array
   for (let i = 0; i < sessionProgress.length; i++) {
     const exercise = dayExercises[i];  // ← Por posición
     
     await tx.sessionExercise.create({
       sessionId: session.id,
       exerciseId: exercise.id,  // ← ID del ejercicio en esa posición
       weight: sessionData.weight,
       sets: sessionData.sets,
       athleteNotes: sessionData.athleteNotes
     });
   }
   ```

3. **ExerciseHistory** (historial del ejercicio - últimas 5 sesiones):
   ```typescript
   await tx.exerciseHistory.create({
     exerciseId: exercise.id,  // ← Vinculado por ID del ejercicio
     date: sessionData.date,
     weight: sessionData.weight,
     sets: sessionData.sets
   });
   ```

4. **Actualiza Exercise.athleteNotes** si hay notas

**Paso 3**: Limpieza automática
- Mantiene solo las últimas 5 entradas en `ExerciseHistory` por ejercicio

### Identificación de ejercicios

#### ⚠️ Problema crítico: Identificación por posición

**Cómo se identifica cada ejercicio**:

1. **Al cargar la sesión**:
   ```typescript
   // session/[indexDay]/page.tsx (línea 54)
   const dayExercises = athlete.routine[indexDay] || [];
   // Se itera por posición: dayExercises[0], dayExercises[1], etc.
   ```

2. **Al guardar la sesión**:
   ```typescript
   // athleteController.saveSession (línea 164-166)
   for (let i = 0; i < sessionProgress.length; i++) {
     const sessionData = sessionProgress[i];
     const exercise = dayExercises[i];  // ← Por posición, no por ID
   }
   ```

3. **Historial vinculado por ID**:
   ```typescript
   // El historial está vinculado por exerciseId en la DB
   exerciseHistory.exerciseId → exercise.id
   ```

### Problemas y escenarios problemáticos

#### 1. **Ejercicio eliminado antes de iniciar sesión**

**Escenario**: El entrenador elimina un ejercicio del día, luego el atleta inicia sesión.

**Qué pasa**:
- El array `athlete.routine[indexDay]` tiene menos ejercicios
- La sesión se inicializa con los ejercicios restantes
- ✅ **Funciona correctamente**: Solo se cargan los ejercicios que existen

**Problema potencial**:
- Si el atleta tenía una sesión en progreso (en memoria) y el entrenador elimina un ejercicio, al recargar la página se pierde ese ejercicio de la sesión

#### 2. **Ejercicio agregado antes de iniciar sesión**

**Escenario**: El entrenador agrega un nuevo ejercicio al día.

**Qué pasa**:
- El array tiene un ejercicio más
- La sesión se inicializa con todos los ejercicios, incluyendo el nuevo
- El nuevo ejercicio no tiene historial, así que se inicializa con valores por defecto (0 peso, rangeMin para reps)
- ✅ **Funciona correctamente**

#### 3. **Ejercicio reordenado (cambio de posición)**

**Escenario**: El entrenador mueve "Press Banca" de posición 0 a posición 2.

**Qué pasa al cargar sesión**:
- El array tiene los ejercicios en el nuevo orden
- La sesión se inicializa con los ejercicios en el nuevo orden
- El historial se carga correctamente porque está vinculado por `exerciseId`
- ✅ **Funciona correctamente**: El historial se mantiene porque el `exerciseId` no cambia

**Problema potencial**:
- Si el atleta tenía una sesión en progreso y el entrenador reordena, al recargar los ejercicios aparecen en el nuevo orden pero el progreso de la sesión puede estar desincronizado

#### 4. **Cambio de nombre de ejercicio**

**Escenario**: El entrenador cambia "Press Banca" a "Press Banca Inclinado".

**Qué pasa**:
- El `exerciseId` se mantiene (solo se actualiza el campo `exercise`)
- El historial sigue vinculado al mismo `exerciseId`
- ✅ **Funciona correctamente**: El historial se mantiene y se carga correctamente

#### 5. **Ejercicio eliminado durante sesión en progreso**

**Escenario**: El atleta está ejecutando una sesión, el entrenador elimina un ejercicio, y luego el atleta finaliza la sesión.

**Qué pasa**:
- El `sessionProgress` en memoria tiene datos para el ejercicio eliminado
- Al guardar, el backend busca ejercicios por posición: `dayExercises[i]`
- Si el ejercicio fue eliminado, `dayExercises[i]` será `undefined` o será un ejercicio diferente
- ⚠️ **Problema**: Los datos de la sesión pueden asociarse al ejercicio incorrecto o perderse

**Código problemático**:
```typescript
// athleteController.saveSession (línea 164-176)
for (let i = 0; i < sessionProgress.length; i++) {
  const exercise = dayExercises[i];  // ← Puede ser undefined o ejercicio incorrecto
  
  if (!exercise) {
    continue;  // ← Se salta el ejercicio, se pierden los datos
  }
}
```

#### 6. **Ejercicio agregado durante sesión en progreso**

**Escenario**: El atleta está ejecutando una sesión, el entrenador agrega un ejercicio, y luego el atleta finaliza.

**Qué pasa**:
- El `sessionProgress` tiene datos solo para los ejercicios originales
- El backend espera `sessionProgress.length === dayExercises.length`
- ⚠️ **Problema**: Si hay más ejercicios en el día que en `sessionProgress`, algunos ejercicios no se guardan

#### 7. **Reordenamiento durante sesión en progreso**

**Escenario**: El atleta está ejecutando una sesión, el entrenador reordena ejercicios, y luego el atleta finaliza.

**Qué pasa**:
- El `sessionProgress` tiene datos en el orden original
- El backend asocia por posición: `sessionProgress[0]` → `dayExercises[0]`
- ⚠️ **Problema crítico**: Los datos de la sesión se asocian a los ejercicios incorrectos

**Ejemplo**:
```
Sesión iniciada con:
  [0] Press Banca (peso: 80kg)
  [1] Sentadilla (peso: 100kg)

Entrenador reordena:
  [0] Sentadilla
  [1] Press Banca

Al guardar:
  sessionProgress[0] (80kg) → dayExercises[0] (Sentadilla) ❌ INCORRECTO
  sessionProgress[1] (100kg) → dayExercises[1] (Press Banca) ❌ INCORRECTO
```

### Soluciones recomendadas

#### Opción 1: Identificación por ID (recomendado)

**Cambiar el formato de `sessionProgress`**:
```typescript
// Actual (por posición)
sessionProgress: [
  { date, weight, sets, athleteNotes },
  { date, weight, sets, athleteNotes }
]

// Propuesto (por ID)
sessionProgress: [
  { exerciseId: "uuid-1", date, weight, sets, athleteNotes },
  { exerciseId: "uuid-2", date, weight, sets, athleteNotes }
]
```

**Ventajas**:
- ✅ Funciona correctamente aunque se reordenen ejercicios
- ✅ Funciona aunque se agreguen/eliminen ejercicios
- ✅ El historial siempre se asocia correctamente

**Desventajas**:
- Requiere refactorizar el frontend y backend
- Cambio en el formato de datos

#### Opción 2: Validación y bloqueo

**Bloquear edición de rutina si hay sesión en progreso**:
- Detectar si el atleta tiene una sesión activa
- Mostrar advertencia al entrenador
- No permitir editar hasta que se finalice la sesión

#### Opción 3: Sincronización inteligente

**Al iniciar sesión, guardar snapshot de la rutina**:
- Guardar el estado de la rutina al iniciar
- Al finalizar, comparar con el estado actual
- Si cambió, mostrar advertencia o intentar mapear por nombre/ID

### Estado actual del sistema

**Fortalezas**:
- ✅ Funciona correctamente si no hay cambios durante la sesión
- ✅ El historial se preserva al cambiar nombre de ejercicio
- ✅ El historial se carga correctamente al iniciar sesión

**Debilidades**:
- ⚠️ Identificación por posición causa problemas si hay cambios durante la sesión
- ⚠️ No hay validación de consistencia entre sesión y rutina actual
- ⚠️ Pérdida de datos si se elimina un ejercicio durante la sesión

---

## Próximos pasos sugeridos
- **Migrar identificación de ejercicios de posición a ID** para evitar problemas de sincronización durante sesiones activas
- **Implementar validación** para detectar cambios en la rutina durante sesiones activas
- Persistir snapshots localmente cuando el atleta esté offline
- Añadir tests e2e (Playwright) para validar flujos críticos
- Completar integración de WhatsApp (mensaje enriquecido, tracking) y MercadoPago desde el frontend
- Internacionalización (i18n) y accesibilidad adicional
