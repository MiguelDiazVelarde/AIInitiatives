// Técnicas de aprendizaje basadas en los principios de Barbara Oakley
// ("Learning How to Learn" / "A Mind for Numbers")
export const OAKLEY_TECHNIQUES = [
  'Modo enfocado y difuso',
  'Recuerdo activo',
  'Repetición espaciada',
  'Fragmentación (chunking)',
  'Intercalado (interleaving)',
  'Técnica Pomodoro',
  'Analogías y metáforas',
  'Enseñar lo aprendido (técnica Feynman)',
] as const;

export type OakleyTechnique = typeof OAKLEY_TECHNIQUES[number];

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  modules: string[];
  recommendedTechniques: OakleyTechnique[];
}

export const COURSES: Course[] = [
  {
    id: 'ingles-ia',
    name: 'Inglés con IA',
    description:
      'Aprende inglés practicando con asistentes de IA, consolidando vocabulario y gramática mediante recuerdo activo y repetición espaciada.',
    category: 'Idiomas',
    level: 'Todos los niveles',
    modules: [
      'Fundamentos y pronunciación',
      'Vocabulario con tarjetas de recuerdo activo',
      'Gramática conversacional con IA',
      'Comprensión auditiva intercalada',
      'Producción oral y feedback de IA',
      'Proyecto final: conversación con IA',
    ],
    recommendedTechniques: ['Recuerdo activo', 'Repetición espaciada', 'Intercalado (interleaving)'],
  },
  {
    id: 'portugues-ia',
    name: 'Portugués con IA',
    description:
      'Domina el portugués practicando con IA generativa, reforzando la memoria a largo plazo con repetición espaciada y práctica intercalada.',
    category: 'Idiomas',
    level: 'Todos los niveles',
    modules: [
      'Fundamentos y pronunciación',
      'Vocabulario con tarjetas de recuerdo activo',
      'Gramática conversacional con IA',
      'Comprensión auditiva intercalada',
      'Producción oral y feedback de IA',
      'Proyecto final: conversación con IA',
    ],
    recommendedTechniques: ['Recuerdo activo', 'Repetición espaciada', 'Intercalado (interleaving)'],
  },
  {
    id: 'typescript-playwright',
    name: 'Desarrollo con TypeScript y Playwright',
    description:
      'Domina TypeScript y la automatización de pruebas con Playwright fragmentando conceptos complejos y alternando modo enfocado y difuso.',
    category: 'Programación',
    level: 'Intermedio',
    modules: [
      'Fundamentos de TypeScript',
      'Tipos avanzados y genéricos',
      'Configuración de Playwright',
      'Automatización de pruebas E2E',
      'Patrones Page Object',
      'Integración continua y reportes',
    ],
    recommendedTechniques: ['Fragmentación (chunking)', 'Intercalado (interleaving)', 'Modo enfocado y difuso'],
  },
  {
    id: 'ingenieria-ia',
    name: 'Ingeniería de IA',
    description:
      'Construye e integra soluciones de IA aplicando analogías para conceptos complejos y enseñando lo aprendido para consolidar el conocimiento.',
    category: 'Inteligencia Artificial',
    level: 'Avanzado',
    modules: [
      'Fundamentos de IA y LLMs',
      'Prompt engineering',
      'Integración de APIs de IA',
      'RAG y bases vectoriales',
      'Agentes de IA',
      'Evaluación y despliegue responsable',
    ],
    recommendedTechniques: ['Analogías y metáforas', 'Enseñar lo aprendido (técnica Feynman)', 'Modo enfocado y difuso'],
  },
];
