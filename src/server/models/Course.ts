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

export interface CourseModule {
  id: string;
  title: string;
  objectives: string[];
  content: string[];
  technique: OakleyTechnique;
  estimatedMinutes: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  modules: CourseModule[];
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
      {
        id: 'fundamentos-pronunciacion',
        title: 'Fundamentos y pronunciación',
        objectives: [
          'Reconocer los sonidos básicos del alfabeto fonético (IPA) del inglés',
          'Practicar pares mínimos (ship/sheep, bit/beat) con corrección de un asistente de IA',
        ],
        content: [
          'Introducción al IPA y a los sonidos que no existen en español',
          'Grabación de tu voz y comparación con pronunciación nativa generada por IA',
          'Sesión enfocada de práctica seguida de una pausa de modo difuso para consolidar',
        ],
        technique: 'Modo enfocado y difuso',
        estimatedMinutes: 45,
      },
      {
        id: 'vocabulario-recuerdo-activo',
        title: 'Vocabulario con tarjetas de recuerdo activo',
        objectives: [
          'Construir un mazo de tarjetas con vocabulario generado y contextualizado por IA',
          'Aplicar autoevaluación (recordar antes de revelar la respuesta) en cada tarjeta',
        ],
        content: [
          'Generación de oraciones de ejemplo con IA para cada palabra nueva',
          'Práctica de recuerdo activo: intenta responder antes de ver la traducción',
          'Registro de palabras difíciles para repasos futuros',
        ],
        technique: 'Recuerdo activo',
        estimatedMinutes: 40,
      },
      {
        id: 'gramatica-conversacional',
        title: 'Gramática conversacional con IA',
        objectives: [
          'Practicar tiempos verbales en contexto conversacional con un tutor de IA',
          'Programar repasos espaciados (1, 3, 7 y 16 días) de las reglas más difíciles',
        ],
        content: [
          'Diálogos guiados con corrección automática de errores gramaticales',
          'Calendario de repetición espaciada para reforzar reglas gramaticales',
          'Ejercicios de transformación de oraciones (presente → pasado → condicional)',
        ],
        technique: 'Repetición espaciada',
        estimatedMinutes: 50,
      },
      {
        id: 'comprension-auditiva',
        title: 'Comprensión auditiva intercalada',
        objectives: [
          'Entrenar el oído con distintos acentos y velocidades de habla generados por IA',
          'Alternar entre tipos de ejercicios auditivos para mejorar la transferencia de aprendizaje',
        ],
        content: [
          'Transcripción de audios cortos generados por IA con distintos acentos',
          'Alternancia entre dictado, preguntas de comprensión y resumen oral',
          'Podcasts breves con vocabulario intercalado de módulos anteriores',
        ],
        technique: 'Intercalado (interleaving)',
        estimatedMinutes: 40,
      },
      {
        id: 'produccion-oral',
        title: 'Producción oral y feedback de IA',
        objectives: [
          'Sostener conversaciones de 25 minutos con un compañero de conversación de IA',
          'Recibir y aplicar retroalimentación estructurada sobre fluidez y precisión',
        ],
        content: [
          'Sesiones Pomodoro de conversación enfocada de 25 minutos con descansos de 5',
          'Feedback de la IA sobre pronunciación, gramática y vocabulario usado',
          'Repetición de la misma conversación mejorando puntos débiles detectados',
        ],
        technique: 'Técnica Pomodoro',
        estimatedMinutes: 30,
      },
      {
        id: 'proyecto-final-ingles',
        title: 'Proyecto final: conversación con IA',
        objectives: [
          'Sostener una conversación completa en inglés sobre un tema elegido',
          'Explicar en tus propias palabras las reglas gramaticales aplicadas durante la conversación',
        ],
        content: [
          'Grabación de una conversación final de 10 minutos con IA',
          'Explicación (técnica Feynman) de 3 reglas gramaticales usadas, como si enseñaras a otra persona',
          'Autoevaluación con rúbrica de fluidez, vocabulario y gramática',
        ],
        technique: 'Enseñar lo aprendido (técnica Feynman)',
        estimatedMinutes: 60,
      },
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
      {
        id: 'fundamentos-pronunciacion-pt',
        title: 'Fundamentos y pronunciación',
        objectives: [
          'Reconocer las vocales nasales y sonidos propios del portugués',
          'Practicar pares mínimos (avó/avô, pão/pau) con corrección de IA',
        ],
        content: [
          'Introducción a las vocales nasales y a la entonación del portugués brasileño/europeo',
          'Grabación y comparación de tu pronunciación con audio nativo generado por IA',
          'Sesión enfocada seguida de una pausa de modo difuso para consolidar sonidos nuevos',
        ],
        technique: 'Modo enfocado y difuso',
        estimatedMinutes: 45,
      },
      {
        id: 'vocabulario-recuerdo-activo-pt',
        title: 'Vocabulario con tarjetas de recuerdo activo',
        objectives: [
          'Construir un mazo de tarjetas con vocabulario contextualizado generado por IA',
          'Aplicar autoevaluación (recordar antes de revelar la respuesta) en cada tarjeta',
        ],
        content: [
          'Generación de oraciones de ejemplo con IA para cada palabra nueva',
          'Práctica de recuerdo activo antes de revelar la traducción',
          'Registro de falsos cognados entre español y portugués',
        ],
        technique: 'Recuerdo activo',
        estimatedMinutes: 40,
      },
      {
        id: 'gramatica-conversacional-pt',
        title: 'Gramática conversacional con IA',
        objectives: [
          'Practicar la conjugación verbal en contexto conversacional con un tutor de IA',
          'Programar repasos espaciados de las reglas gramaticales más difíciles',
        ],
        content: [
          'Diálogos guiados con corrección automática de errores gramaticales',
          'Calendario de repetición espaciada para el subjuntivo y los pretéritos',
          'Ejercicios de transformación de oraciones entre tiempos verbales',
        ],
        technique: 'Repetición espaciada',
        estimatedMinutes: 50,
      },
      {
        id: 'comprension-auditiva-pt',
        title: 'Comprensión auditiva intercalada',
        objectives: [
          'Entrenar el oído con acentos de Brasil y Portugal generados por IA',
          'Alternar entre tipos de ejercicios auditivos para mejorar la transferencia',
        ],
        content: [
          'Transcripción de audios cortos generados por IA con distintos acentos',
          'Alternancia entre dictado, preguntas de comprensión y resumen oral',
          'Podcasts breves con vocabulario intercalado de módulos anteriores',
        ],
        technique: 'Intercalado (interleaving)',
        estimatedMinutes: 40,
      },
      {
        id: 'produccion-oral-pt',
        title: 'Producción oral y feedback de IA',
        objectives: [
          'Sostener conversaciones de 25 minutos con un compañero de conversación de IA',
          'Recibir y aplicar retroalimentación estructurada sobre fluidez y precisión',
        ],
        content: [
          'Sesiones Pomodoro de conversación enfocada de 25 minutos con descansos de 5',
          'Feedback de la IA sobre pronunciación, gramática y vocabulario usado',
          'Repetición de la misma conversación mejorando puntos débiles detectados',
        ],
        technique: 'Técnica Pomodoro',
        estimatedMinutes: 30,
      },
      {
        id: 'proyecto-final-portugues',
        title: 'Proyecto final: conversación con IA',
        objectives: [
          'Sostener una conversación completa en portugués sobre un tema elegido',
          'Explicar en tus propias palabras las reglas gramaticales aplicadas durante la conversación',
        ],
        content: [
          'Grabación de una conversación final de 10 minutos con IA',
          'Explicación (técnica Feynman) de 3 reglas gramaticales usadas, como si enseñaras a otra persona',
          'Autoevaluación con rúbrica de fluidez, vocabulario y gramática',
        ],
        technique: 'Enseñar lo aprendido (técnica Feynman)',
        estimatedMinutes: 60,
      },
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
      {
        id: 'fundamentos-typescript',
        title: 'Fundamentos de TypeScript',
        objectives: [
          'Comprender el sistema de tipos estático y sus beneficios frente a JavaScript',
          'Dividir el aprendizaje en bloques pequeños: tipos primitivos, interfaces y funciones tipadas',
        ],
        content: [
          'Tipos primitivos, arrays, tuplas y enums',
          'Interfaces vs. type aliases',
          'Fragmentación del temario en bloques de 20-30 minutos con ejercicios cortos por bloque',
        ],
        technique: 'Fragmentación (chunking)',
        estimatedMinutes: 50,
      },
      {
        id: 'tipos-avanzados-genericos',
        title: 'Tipos avanzados y genéricos',
        objectives: [
          'Aplicar genéricos para escribir código reutilizable y type-safe',
          'Autoevaluarte explicando de memoria qué hace cada utility type antes de consultar la documentación',
        ],
        content: [
          'Genéricos en funciones, clases e interfaces',
          'Utility types: Partial, Pick, Omit, Record',
          'Quiz de recuerdo activo: predecir el tipo resultante antes de compilar',
        ],
        technique: 'Recuerdo activo',
        estimatedMinutes: 55,
      },
      {
        id: 'configuracion-playwright',
        title: 'Configuración de Playwright',
        objectives: [
          'Instalar y configurar un proyecto de Playwright con TypeScript',
          'Entender la estructura de carpetas y el archivo de configuración',
        ],
        content: [
          'Instalación, `playwright.config.ts` y navegadores soportados',
          'Estructura de proyecto: tests, fixtures y reportes',
          'Sesión enfocada de configuración seguida de una pausa difusa antes de escribir el primer test',
        ],
        technique: 'Modo enfocado y difuso',
        estimatedMinutes: 40,
      },
      {
        id: 'automatizacion-e2e',
        title: 'Automatización de pruebas E2E',
        objectives: [
          'Escribir pruebas end-to-end combinando interacciones de UI y llamadas a API',
          'Alternar entre distintos tipos de aserciones y localizadores para generalizar el aprendizaje',
        ],
        content: [
          'Localizadores (`getByRole`, `getByTestId`) y acciones del usuario',
          'Aserciones visuales, de texto y de red intercaladas en una misma suite',
          'Mezcla de pruebas de UI y de API en un mismo flujo de trabajo',
        ],
        technique: 'Intercalado (interleaving)',
        estimatedMinutes: 60,
      },
      {
        id: 'patrones-page-object',
        title: 'Patrones Page Object',
        objectives: [
          'Aplicar el patrón Page Object Model (POM) para mantener pruebas escalables',
          'Reforzar el patrón con repasos espaciados en distintos proyectos de práctica',
        ],
        content: [
          'Diseño de clases Page Object y separación de responsabilidades',
          'Refactorización de pruebas existentes hacia POM',
          'Repaso espaciado: reescribir el mismo POM sin mirar el original después de unos días',
        ],
        technique: 'Repetición espaciada',
        estimatedMinutes: 50,
      },
      {
        id: 'ci-reportes',
        title: 'Integración continua y reportes',
        objectives: [
          'Integrar la suite de Playwright en un pipeline de CI/CD',
          'Explicar el pipeline configurado a un compañero como si nunca lo hubiera visto',
        ],
        content: [
          'Configuración de un workflow de GitHub Actions para ejecutar pruebas',
          'Generación e interpretación de reportes HTML y de trazas',
          'Explicación tipo Feynman del pipeline completo, desde el commit hasta el reporte',
        ],
        technique: 'Enseñar lo aprendido (técnica Feynman)',
        estimatedMinutes: 45,
      },
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
      {
        id: 'fundamentos-ia-llms',
        title: 'Fundamentos de IA y LLMs',
        objectives: [
          'Explicar con analogías cómo funciona un modelo de lenguaje a alto nivel',
          'Distinguir entrenamiento, ajuste fino (fine-tuning) e inferencia',
        ],
        content: [
          'Analogía del "autocompletado gigante" para explicar los LLMs',
          'Tokens, embeddings y ventanas de contexto explicados con metáforas cotidianas',
          'Diferencias entre modelos base, instruct y de razonamiento',
        ],
        technique: 'Analogías y metáforas',
        estimatedMinutes: 50,
      },
      {
        id: 'prompt-engineering',
        title: 'Prompt engineering',
        objectives: [
          'Diseñar prompts efectivos usando técnicas de rol, contexto y ejemplos (few-shot)',
          'Recordar activamente las técnicas de prompting antes de consultar una chuleta',
        ],
        content: [
          'Prompting zero-shot, few-shot y chain-of-thought',
          'Plantillas de prompts para tareas de clasificación, resumen y generación',
          'Autoevaluación: reconstruir de memoria una plantilla de prompt antes de revisarla',
        ],
        technique: 'Recuerdo activo',
        estimatedMinutes: 45,
      },
      {
        id: 'integracion-apis-ia',
        title: 'Integración de APIs de IA',
        objectives: [
          'Consumir APIs de modelos de IA desde una aplicación TypeScript/Node',
          'Fragmentar la integración en bloques: autenticación, llamada, manejo de errores y streaming',
        ],
        content: [
          'Autenticación y manejo seguro de claves de API',
          'Llamadas síncronas y streaming de respuestas',
          'Manejo de errores, reintentos y límites de tasa (rate limiting)',
        ],
        technique: 'Fragmentación (chunking)',
        estimatedMinutes: 55,
      },
      {
        id: 'rag-bases-vectoriales',
        title: 'RAG y bases vectoriales',
        objectives: [
          'Implementar un flujo de Retrieval-Augmented Generation (RAG) básico',
          'Alternar entre distintos tipos de datos (texto, PDF, código) para generalizar el patrón RAG',
        ],
        content: [
          'Embeddings y bases de datos vectoriales',
          'Fragmentación (chunking) de documentos y estrategias de recuperación',
          'Práctica intercalada indexando distintos tipos de fuentes de conocimiento',
        ],
        technique: 'Intercalado (interleaving)',
        estimatedMinutes: 60,
      },
      {
        id: 'agentes-ia',
        title: 'Agentes de IA',
        objectives: [
          'Diseñar un agente de IA con herramientas (tools) y memoria',
          'Alternar sesiones de diseño enfocado con pausas de modo difuso para resolver bloqueos de arquitectura',
        ],
        content: [
          'Arquitectura de agentes: planificación, herramientas y memoria',
          'Orquestación de múltiples pasos y llamadas a herramientas',
          'Sesión de diseño enfocada seguida de una caminata o descanso en modo difuso',
        ],
        technique: 'Modo enfocado y difuso',
        estimatedMinutes: 55,
      },
      {
        id: 'evaluacion-despliegue',
        title: 'Evaluación y despliegue responsable',
        objectives: [
          'Definir métricas de evaluación para soluciones de IA (precisión, latencia, costo, seguridad)',
          'Explicar el ciclo de vida completo de una solución de IA como si se lo enseñaras a un equipo nuevo',
        ],
        content: [
          'Métricas de evaluación y datasets de prueba',
          'Consideraciones de seguridad, sesgo y responsabilidad',
          'Explicación tipo Feynman del ciclo completo: datos, modelo, evaluación y despliegue',
        ],
        technique: 'Enseñar lo aprendido (técnica Feynman)',
        estimatedMinutes: 50,
      },
    ],
    recommendedTechniques: ['Analogías y metáforas', 'Enseñar lo aprendido (técnica Feynman)', 'Modo enfocado y difuso'],
  },
];
