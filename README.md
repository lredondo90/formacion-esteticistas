# Aula Estética

Aplicación web de formación interactiva para esteticistas, en tres versiones de idioma:

- **España** (`es-ES`)
- **Latinoamérica** (`es-419`), con el vocabulario local (gabinete, humectación, barros…)
- **English** (`en`)

Cada curso combina lecciones cortas, tarjetas para girar, quizzes, ejercicios de unir parejas, ordenar pasos y casos reales, además de:

- **Lecciones en vídeo interactivo**: escenas animadas con subtítulos, narración por voz opcional y pausas con preguntas.
- **Zonas para tocar** sobre ilustraciones (rostro, ojo, uña, cuerpo).
- **Simulaciones con decisiones**: conversaciones con clientas en las que cada respuesta lleva a un final distinto.

Hay 10 cursos premium con las primeras lecciones gratis, compra por curso o pase completo (en modo demostración, sin cobro real) y certificado de finalización imprimible. El progreso, los puntos y las compras se guardan en el navegador.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # genera dist/
```

## Añadir o editar cursos

Los cursos gratuitos están en `src/courses.ts` y los premium en `src/premium/` (un archivo por curso, con su precio en `premium` y las lecciones gratuitas en `freeSteps`).

Para usar un vídeo real en una lección `video`, añade `src: '/videos/archivo.mp4'` y las preguntas en `cues` (con el segundo en que aparece cada una); las escenas animadas se usan mientras no haya vídeo. Cada texto tiene (o `tx(es, en, la?)`) `es`, `en` y, opcionalmente, `la` (si en Latinoamérica se dice distinto que en España). Los textos de la interfaz están en `src/i18n.ts`.

## Despliegue

El proyecto está preparado para Vercel (`vercel.json`): importa el repositorio en https://vercel.com/new y Vercel detecta Vite automáticamente.
