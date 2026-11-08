# StudyIA

App móvil educativa que convierte apuntes (fotos, PDF o texto) en resúmenes, flashcards y quizzes, y registra el progreso del estudiante. Proyecto Final de Desarrollo Móvil, Ingeniería de Sistemas, Universidad de La Guajira.

**Integrantes:** _(completar nombres y códigos)_

**Stack:** Expo SDK 58 · TypeScript · Expo Router · SQLite + Drizzle ORM · Supabase (Auth, Postgres, Edge Functions) · expo-secure-store · Reanimated 4 · API de Gemini

## Cómo ejecutar

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea `.env` a partir de `.env.example`, con la URL y la **publishable key** de Supabase. Nunca la secret key.
3. Inicia la app y ábrela con Expo Go en un teléfono o emulador:
   ```bash
   npx expo start
   ```

Sin configurar nada más ya funciona con **Continuar sin cuenta**: datos solo en el teléfono y análisis de texto sin IA.

## Activar la nube y la IA

Solo hace falta una vez por proyecto de Supabase, y en el proyecto `StudyIA` del equipo ya está hecho: estos pasos son para montarlo en otro proyecto. Requiere la [CLI de Supabase](https://supabase.com/docs/guides/cli).

1. Aplica las migraciones de `supabase/migrations/`:
   ```bash
   npx supabase link --project-ref <ref-del-proyecto>
   ```
   ```bash
   npx supabase db push
   ```
2. Crea una clave en [Google AI Studio](https://aistudio.google.com/apikey) y guárdala como secreto de Supabase. **Nunca en la app, en `.env` ni en una variable `EXPO_PUBLIC_`**:
   ```bash
   npx supabase secrets set GEMINI_API_KEY=<tu-clave>
   ```
3. Despliega la función:
   ```bash
   npx supabase functions deploy study-ai
   ```
4. En Authentication → Providers → Email, desactiva **Confirm email** si quieres que registrarse inicie sesión de inmediato.

Variables opcionales de la función: `GEMINI_MODEL` (por defecto `gemini-3.5-flash-lite`), `GEMINI_FALLBACK_MODEL` (`gemini-3.1-flash-lite`) y `STUDY_AI_DAILY_LIMIT` (40 solicitudes por usuario al día).

> **Privacidad:** la app usa el plan gratuito de Gemini, en el que Google puede usar el contenido enviado para mejorar sus productos. La app lo avisa en la pantalla de escaneo y en «Acerca de». No subas datos personales ni información sensible.

## Comandos

```bash
npm run lint
```
```bash
npm run typecheck
```
```bash
npm test
```

Si cambias `src/db/schema.ts`, genera la migración con `npm run db:generate`; se aplica sola al abrir la app.

## Qué hace

| Objetivo del proyecto | Dónde está |
|---|---|
| Registrar y organizar materias, con el catálogo Uniguajira | `src/app/(tabs)/materias.tsx`, `src/app/materia/` |
| Cargar fotos, documentos o texto | `src/app/(tabs)/escanear.tsx`, `src/components/CameraScanner.tsx` |
| Generar resumen, conceptos, flashcards y quiz con IA | `supabase/functions/study-ai/`, `src/services/ai/` |
| Explicar temas difíciles (tutor) | Sección «Pregúntale a StudyIA» en `src/app/material/[id].tsx` |
| Estudiar con repetición espaciada (Leitner) | `src/app/estudio/flashcards.tsx`, `src/lib/study.ts` |
| Registrar resultados de los quizzes | `src/app/estudio/quiz.tsx` |
| Estadísticas de progreso y racha | `src/app/(tabs)/practica.tsx`, `src/lib/study.ts` |
| Gráficas de actividad semanal y de evolución en quizzes | `src/components/Charts.tsx`, `src/lib/progress.ts` |
| Recordatorio de repaso (notificación local, funciona sin conexión) | `src/context/RemindersContext.tsx`, `src/services/reminders.ts`, tarjeta en Perfil |
| Consultar de nuevo lo generado | `src/app/material/[id].tsx` |

## Arquitectura

```text
src/
├── app/            # Rutas de Expo Router; Stack.Protected separa el acceso del resto
├── components/     # UI compartida; motion/ son las animaciones
├── context/        # AuthContext, SyncContext, RemindersContext, ThemeContext
├── db/             # schema.ts, client.ts y repositorios (solo ellos hablan con Drizzle)
├── hooks/          # useStudyData (useLiveQuery), useCamera
├── lib/            # supabase, secureStorage y lógica pura de estudio
└── services/       # ai/ (pipeline y generadores), sync/, files.ts
supabase/
├── migrations/     # Esquema de Postgres con RLS
└── functions/      # study-ai: único punto que habla con Gemini
drizzle/            # Migraciones de SQLite
```

- **Offline-first:** SQLite es la fuente de verdad; las pantallas leen de ahí con `useLiveQuery`. La foto va al sistema de archivos y su ruta a SQLite.
- **Sincronización** (`src/services/sync/`): baja y luego sube, con regla «gana el último cambio» y borrado lógico (`deletedAt`). Es totalmente automática: al abrir la app, al iniciar sesión, al recuperar la conexión, al volver a la app y unos segundos después de cada cambio. Si falla, reintenta sola con esperas crecientes, sin ningún botón. Una fila está pendiente si `syncedAt` está vacío o es anterior a `updatedAt`.
- **Sesión:** en SecureStore, con un adaptador que parte el valor en fragmentos. Sin red y con el token vencido, la cuenta sigue abierta para poder estudiar.
- **Recordatorios:** hay un solo aviso programado a la vez, con id fijo. Se recalcula con los datos de SQLite cada vez que cambian las flashcards o la actividad y al volver a la app. Solo avisa si hay flashcards vencidas a esa hora o si la racha está en riesgo; si no hay nada, no programa nada. El permiso se pide al activar el interruptor, no al abrir la app. Al cerrar sesión se cancela.
- **IA:** la clave vive solo en la Edge Function. La función verifica la sesión, aplica una cuota diaria, reintenta ante 503 o timeout y usa un modelo de respaldo.
- **Sin conexión:** el texto se analiza con un generador local **que no es IA**: extrae frases del apunte y la app lo marca como «Generado sin IA». Fotos y PDF solo los puede leer la IA, así que quedan pendientes y se procesan al volver la conexión.

## Animaciones

[Animate UI](https://animate-ui.com/docs/installation) es solo para web: depende de Motion, Radix/Base UI y shadcn/ui, que requieren el DOM. Por eso sus efectos se reconstruyeron con Reanimated 4 y `react-native-svg` en `src/components/motion/`. Todos respetan la opción «reducir movimiento» del sistema.

| Efecto de Animate UI | En StudyIA | Dónde se ve |
|---|---|---|
| Flip Card | `FlipCard` | Flashcards |
| Ripple Button | `RippleButton` | Botones principales |
| Tabs | `SlidingTabs` | Acceso, Escanear, Universidad, barra inferior |
| Accordion | `Accordion` | Apunte, Universidad |
| Checkbox | `AnimatedCheck` | Opciones del quiz |
| Progress | `ProgressBar`, `ProgressRing` | Progreso y resultados |
| Fireworks Background | `Fireworks` | Al aprobar un quiz |
| Sliding Number | `SlidingNumber` | Estadísticas |
| Shimmering Text | `ShimmeringText` | Mientras la IA procesa |
| Typing Text | `TypingText` | Respuesta del tutor |

## Qué quedó verificado y qué no

**Probado en Android (emulador con Expo Go y teléfono físico) contra Supabase y Gemini reales:**
- Registro e inicio de sesión.
- Sincronización automática: lo creado en modo avión subió solo al volver internet.
- Resumen, flashcards y quiz con Gemini desde texto, foto de galería y PDF.
- Foto creada sin conexión: quedó pendiente y se procesó sola al reconectar.
- Tutor, flashcards, quiz, estadísticas, tema oscuro, cámara y su permiso, borrado y cierre de sesión.
- Teclado: el campo activo queda visible y el scroll funciona con el teclado abierto.
- Recordatorio: permiso, programación y llegada de la notificación a la hora elegida («Hora de repasar · 8 flashcards te esperan.»).
- Gráficas de la semana y de quizzes en tema claro y oscuro, con su vista de tabla.

Además, 45 pruebas unitarias con Jest.

**Probado solo con la API de Gemini simulada:** reintentos, modelo de respaldo, cuota y validaciones de la Edge Function.

**Sin probar todavía:**
- iOS.
- Abrir el repaso al tocar el recordatorio. En Expo Go para Android, tocar cualquier notificación local hace que Expo Go se cierre: su `LauncherActivity` falla con «Cannot access database on the main thread». El fallo es de Expo Go y ocurre antes de que llegue a nuestro código. Hay que probarlo con un development build (`npx expo run:android`).
- Dos teléfonos con la misma cuenta a la vez.

**Limitaciones conocidas:**
- La versión web no funciona: `expo-sqlite` se bloquea en el navegador al abrir la base de forma síncrona. El objetivo es móvil.
- Las fotos y los PDF se quedan en el teléfono donde se subieron. A otro dispositivo solo llega lo generado.
- Los datos del modo sin cuenta no pasan a una cuenta creada después.
- Los archivos Word no se admiten: solo PDF, texto e imágenes.
- En Expo Go para Android no se puede crear el canal propio «Recordatorios de repaso». El aviso sale entonces por el canal por defecto y en el registro aparece una advertencia. En un development build el canal se crea normalmente.
- En desarrollo, al guardar un archivo puede aparecer un aviso `REMOVE_ROUTES` por Fast Refresh. No apareció en arranques limpios ni al cerrar sesión.
- La cuota de IA (40 solicitudes al día por usuario) es de la app; el plan gratuito de Gemini tiene sus propios límites, que se ven en AI Studio.
