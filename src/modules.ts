import type { Course, Question, Step } from './courses'
import type { Text } from './i18n'

export type Module = { emoji: string; title: Text; steps: Step[] }

// Builds a course from its modules plus a final exam. The whole first module is the free preview.
export function modular(course: Omit<Course, 'steps' | 'modules' | 'freeSteps'>, modules: Module[], exam: Question[]): Course {
  let start = 0
  const meta = modules.map((m) => {
    const entry = { emoji: m.emoji, title: m.title, start, end: start + m.steps.length }
    start = entry.end
    return entry
  })
  return {
    ...course,
    modules: meta,
    freeSteps: modules[0].steps.length,
    steps: [...modules.flatMap((m) => m.steps), { kind: 'exam', title: { es: 'Examen final', en: 'Final exam' }, questions: exam, pass: 0.8 }],
  }
}
