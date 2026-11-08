# AI-LOG — StudyIA

**Herramientas:** Google Antigravity (Gemini) para la primera versión; Claude Code para la migración descrita aquí.

## Prompts usados

1. «En la carpeta de trabajo hay un proyecto el cual se debe seguir avanzando […]. Ahí te puse unas rutas de otras cosas que se han hecho en clases […] y también creo que en una utilicé animación, igual te dejo el enlace https://animate-ui.com/docs/installation; usa la que se pueda implementar en app móvil o rehazla para móvil.»
2. «Sigue avanzando con el proyecto.» La IA propuso recordatorios de repaso con notificaciones locales y gráficas de progreso en Práctica.
3. «Cómo funciona lo de los programas, ¿es funcional o solo es decoración? Que al establecer una carrera la aplicación sea temática a esta, que pueda agregar otra carrera o cambiarla, y que se mezclen las temáticas o que cambie; que al tomar la captura del apunte la IA recomiende, explique, dé alternativas, un plan de estudio, aporte conocimiento y explique palabras o conceptos difíciles.» Después pidió poder elegir el semestre y que las palabras explicadas salieran en negrilla y subrayadas, con una pantalla de significado y contexto al tocarlas.

## Qué generó la IA

- Migración de JavaScript con navegación manual a TypeScript con Expo Router y `Stack.Protected`.
- Base local con SQLite y Drizzle, repositorios, sincronización con Supabase y sesión en SecureStore, siguiendo los patrones de las Semanas 6 a 9 y del parcial.
- Edge Function con Gemini, generador local sin conexión, repaso Leitner, quizzes y estadísticas reales.
- Versión móvil de los efectos de Animate UI con Reanimated.

## Qué se corrigió de lo que había

- **La «IA» era simulada:** un `setTimeout` que devolvía siempre el mismo texto, y el botón «Guardar» no guardaba nada. Las estadísticas y el quiz eran datos fijos. Se reemplazó por lógica real.
- **Inicio de sesión falso:** sin Supabase, cualquier correo y contraseña entraban. Se eliminó.
- **Credenciales en el repositorio:** `.env` estaba versionado y la publishable key estaba escrita en el código. Se sacaron de ahí. El `.env` sigue en el historial de git anterior.
- **Promesa engañosa:** la pantalla decía «Supabase Conectado» solo porque había credenciales.

## Alucinaciones o errores detectados

Los verificamos contra la versión instalada o la documentación, no de memoria:

- **`StyleSheet.absoluteFillObject`:** ya no existe en la versión instalada de React Native. Lo detectó `tsc`.
- **Barra de pestañas:** se asumió la prop `navigation` de versiones anteriores. En Expo Router 58 son `emitter` y `navigateToTab`; se confirmó leyendo sus tipos.
- **API de Gemini:** se asumía `generateContent`. La documentación actual usa `POST /v1beta/interactions`, con otra forma de petición y respuesta.
- **Web:** se configuraron cabeceras COOP/COEP en Metro siguiendo la documentación para web, pero el servidor de desarrollo no las aplicó, y aun con ellas `expo-sqlite` se bloqueó en el navegador. Se descartó esa configuración y se probó en un emulador Android.
- **Reglas de React:** `useRef(new Animated.Value())`, `setState` dentro de efectos y un hook llamado `useImage` que no era hook fallaron en lint y se reescribieron.

## Errores encontrados al probar en el dispositivo

Pasaban lint, tipos y pruebas unitarias; solo aparecieron al usar la app real:

- **PDF:** `expo-document-picker` dejaba un archivo que `expo-file-system` no podía copiar (`Missing 'READ' permission`). Se cambió a `File.pickFileAsync`.
- **Nombres de archivo:** Android devolvía títulos como `37` o `document:36`. Ahora se ignoran.
- **Teclado:** tapaba el campo activo. Además, en Android `measureInWindow` no cuenta la barra de estado, así que comparar con la posición del teclado dejaba el campo pegado; se compara con el marco del scroll.
- **Respaldo:** el usuario pidió quitar el botón «Sincronizar». Ahora es automático, con reintentos crecientes si falla.
- **Canal de notificaciones:** en Expo Go para Android, `setNotificationChannelAsync` falla con un error nativo y dejaba una promesa sin manejar en pantalla. Ahora el error se captura y el aviso usa el canal por defecto. También se creaba el canal solo al pedir el permiso; ahora se crea al programar cada aviso.
- **Tocar el recordatorio:** en Expo Go, Expo Go se cierra antes de abrir la app. Lo confirmamos en `logcat`, así que la navegación al repaso queda pendiente de probar en un development build.
- **Textos de las gráficas:** se corrigieron «p. m.. 8» (doble punto) y «Tus últimos 1 resultados». La gráfica semanal abría en «hoy · sin actividad»; ahora abre en el último día con actividad.

## Decisiones tomadas por el equipo

- **Proveedor de IA:** Gemini en plan gratuito, con la clave solo en los secretos de Supabase. Google puede usar el contenido en ese plan, así que la app lo avisa.
- **Sin conexión:** el generador local se presenta como «Generado sin IA»; no se hace pasar por IA.
- **Programas académicos:** antes eran decorativos (solo un texto en el perfil). Ahora la carrera cambia el color de la app, orienta a la IA y sugiere asignaturas.
- **Conocimiento externo de la IA:** el resumen, las flashcards y el quiz siguen basados solo en el apunte. La guía puede aportar más, pero aparte y marcado («Esto no viene de tu apunte»), para que el estudiante sepa qué contrastar.
- **Palabras resaltadas:** al principio solo se resaltaba el glosario de la IA, así que en los apuntes generados sin IA no aparecía ninguna negrilla. Ahora también se resaltan los conceptos clave y las palabras difíciles detectadas en el texto. El usuario pidió además que la pantalla de la palabra explicara qué significa en el tema, no dónde aparece: se agregó la acción `term` a la Edge Function.
- **Colores por facultad:** los tonos se eligieron calculando el contraste, no a ojo. Ningún tono servía a la vez para texto blanco y para leerse sobre las tarjetas oscuras, así que en modo oscuro el acento lleva texto oscuro encima (`onPrimary`).
