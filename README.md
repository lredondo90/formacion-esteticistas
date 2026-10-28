# Aula Estética

Aplicación web de formación interactiva para esteticistas, en tres versiones de idioma:

- **España** (`es-ES`)
- **Latinoamérica** (`es-419`), con el vocabulario local (gabinete, humectación, barros…)
- **English** (`en`)

Cada curso combina lecciones cortas, tarjetas para girar, quizzes, ejercicios de unir parejas, ordenar pasos y casos reales. El progreso y los puntos se guardan en el navegador.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # genera dist/
```

## Añadir o editar cursos

Los cursos están en `src/courses.ts`. Cada texto tiene `es`, `en` y, opcionalmente, `la` (si en Latinoamérica se dice distinto que en España). Los textos de la interfaz están en `src/i18n.ts`.

## Despliegue

El proyecto está preparado para Vercel (`vercel.json`): importa el repositorio en https://vercel.com/new y Vercel detecta Vite automáticamente.
