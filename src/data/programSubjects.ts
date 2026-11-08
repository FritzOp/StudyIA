/**
 * Plan de estudios DE REFERENCIA por programa: asignaturas típicas de cada carrera en Colombia
 * y el semestre en que suelen cursarse. No es el plan oficial de Uniguajira (puede variar de
 * un semestre o de nombre); sirve para sugerir materias según la carrera y el semestre.
 *
 * Formato compacto: [nombre, semestre].
 */
type Entry = [name: string, semester: number];

export const PROGRAM_SUBJECTS: Record<string, { icon: string; subjects: Entry[] }> = {
  // --- Facultad de Ingeniería ---
  sistemas: {
    icon: 'laptop',
    subjects: [
      ['Algoritmos y Programación', 1], ['Cálculo Diferencial', 1], ['Programación Orientada a Objetos', 2],
      ['Álgebra Lineal', 2], ['Estructuras de Datos', 3], ['Matemáticas Discretas', 3], ['Bases de Datos', 4],
      ['Arquitectura de Computadores', 4], ['Sistemas Operativos', 5], ['Ingeniería de Software', 5],
      ['Redes de Computadores', 6], ['Desarrollo Web', 6], ['Seguridad Informática', 7],
      ['Desarrollo de Aplicaciones Móviles', 8], ['Inteligencia Artificial', 8], ['Gestión de Proyectos de TI', 9],
    ],
  },
  industrial: {
    icon: 'factory',
    subjects: [
      ['Introducción a la Ingeniería Industrial', 1], ['Cálculo Diferencial', 1], ['Dibujo Técnico', 2],
      ['Estadística Descriptiva', 3], ['Procesos Industriales', 3], ['Investigación de Operaciones', 4],
      ['Ingeniería de Métodos', 4], ['Control de Calidad', 5], ['Ingeniería Económica', 5],
      ['Logística y Cadena de Suministro', 6], ['Planeación de la Producción', 6], ['Simulación', 7],
      ['Seguridad Industrial', 7], ['Gerencia de Proyectos', 8],
    ],
  },
  ambiental: {
    icon: 'leaf',
    subjects: [
      ['Introducción a la Ingeniería Ambiental', 1], ['Química General', 1], ['Biología General', 2],
      ['Ecología', 3], ['Química Ambiental', 3], ['Microbiología Ambiental', 4], ['Hidrología', 4],
      ['Contaminación Atmosférica', 5], ['Tratamiento de Aguas Residuales', 6], ['Residuos Sólidos', 6],
      ['Evaluación de Impacto Ambiental', 7], ['Legislación Ambiental', 7], ['Sistemas de Gestión Ambiental', 8],
    ],
  },
  civil: {
    icon: 'office-building',
    subjects: [
      ['Introducción a la Ingeniería Civil', 1], ['Cálculo Diferencial', 1], ['Dibujo de Ingeniería', 2],
      ['Estática', 3], ['Topografía', 3], ['Resistencia de Materiales', 4], ['Materiales de Construcción', 4],
      ['Mecánica de Suelos', 5], ['Hidráulica', 5], ['Análisis Estructural', 6], ['Concreto Reforzado', 7],
      ['Vías y Pavimentos', 7], ['Acueductos y Alcantarillados', 8], ['Gerencia de Obras', 9],
    ],
  },
  mecanica: {
    icon: 'cog',
    subjects: [
      ['Introducción a la Ingeniería Mecánica', 1], ['Cálculo Diferencial', 1], ['Dibujo Mecánico', 2],
      ['Estática', 3], ['Dinámica', 4], ['Termodinámica', 4], ['Resistencia de Materiales', 5],
      ['Mecánica de Fluidos', 5], ['Procesos de Manufactura', 6], ['Diseño de Elementos de Máquinas', 7],
      ['Transferencia de Calor', 7], ['Máquinas Térmicas', 8], ['Mantenimiento Industrial', 8],
    ],
  },
  energias: {
    icon: 'lightning-bolt',
    subjects: [
      ['Introducción a la Ingeniería en Energías', 1], ['Cálculo Diferencial', 1], ['Física Mecánica', 2],
      ['Termodinámica', 3], ['Circuitos Eléctricos', 4], ['Energía Solar Fotovoltaica', 5], ['Energía Eólica', 5],
      ['Máquinas Eléctricas', 6], ['Eficiencia Energética', 6], ['Sistemas de Potencia', 7],
      ['Biomasa y Bioenergía', 7], ['Formulación de Proyectos Energéticos', 8],
    ],
  },
  tec_software: {
    icon: 'code-tags',
    subjects: [
      ['Lógica de Programación', 1], ['Fundamentos de Computación', 1], ['Programación Orientada a Objetos', 2],
      ['Bases de Datos', 2], ['Desarrollo Web', 3], ['Estructuras de Datos', 3], ['Desarrollo de Aplicaciones Móviles', 4],
      ['Ingeniería de Software', 4], ['Pruebas de Software', 5], ['Proyecto de Software', 6],
    ],
  },
  tec_redes: {
    icon: 'lan',
    subjects: [
      ['Fundamentos de Redes', 1], ['Electrónica Básica', 1], ['Sistemas Operativos', 2], ['Cableado Estructurado', 2],
      ['Enrutamiento y Conmutación', 3], ['Administración de Servidores', 4], ['Redes Inalámbricas', 4],
      ['Seguridad en Redes', 5], ['Proyecto de Redes', 6],
    ],
  },
  tec_energias: {
    icon: 'solar-power',
    subjects: [
      ['Fundamentos de Electricidad', 1], ['Matemáticas Básicas', 1], ['Energía Solar', 2], ['Instalaciones Eléctricas', 3],
      ['Energía Eólica', 3], ['Mantenimiento de Sistemas Renovables', 4], ['Eficiencia Energética', 5],
      ['Proyecto de Energías Renovables', 6],
    ],
  },

  // --- Facultad de Ciencias Económicas y Administrativas ---
  admin_empresas: {
    icon: 'briefcase-outline',
    subjects: [
      ['Fundamentos de Administración', 1], ['Matemáticas Básicas', 1], ['Contabilidad General', 2],
      ['Microeconomía', 2], ['Estadística Descriptiva', 3], ['Macroeconomía', 3], ['Mercadeo', 4],
      ['Gestión del Talento Humano', 4], ['Costos y Presupuestos', 5], ['Finanzas Corporativas', 6],
      ['Producción y Operaciones', 6], ['Formulación y Evaluación de Proyectos', 7], ['Gerencia Estratégica', 8],
      ['Emprendimiento', 8],
    ],
  },
  admin_maritima: {
    icon: 'ferry',
    subjects: [
      ['Fundamentos de Administración', 1], ['Introducción al Sector Marítimo', 1], ['Contabilidad General', 2],
      ['Geografía Económica Marítima', 3], ['Derecho Marítimo', 4], ['Operaciones Portuarias', 5],
      ['Transporte Marítimo', 5], ['Logística Internacional', 6], ['Comercio Exterior', 6],
      ['Gestión Aduanera', 7], ['Gerencia Portuaria', 8],
    ],
  },
  admin_publica: {
    icon: 'bank-outline',
    subjects: [
      ['Fundamentos de Administración Pública', 1], ['Constitución Política', 1], ['Teoría del Estado', 2],
      ['Derecho Administrativo', 3], ['Hacienda Pública', 4], ['Políticas Públicas', 5], ['Presupuesto Público', 5],
      ['Contratación Estatal', 6], ['Gestión Territorial', 7], ['Control Fiscal', 8],
    ],
  },
  admin_turistica: {
    icon: 'beach',
    subjects: [
      ['Introducción al Turismo', 1], ['Fundamentos de Administración', 1], ['Geografía Turística', 2],
      ['Patrimonio Cultural', 3], ['Gestión Hotelera', 4], ['Alimentos y Bebidas', 4], ['Mercadeo Turístico', 5],
      ['Agencias de Viajes', 6], ['Ecoturismo', 6], ['Planificación Turística', 7], ['Turismo Étnico Wayuu', 8],
    ],
  },
  contaduria: {
    icon: 'calculator-variant',
    subjects: [
      ['Contabilidad General', 1], ['Matemáticas Básicas', 1], ['Contabilidad Intermedia', 2],
      ['Microeconomía', 2], ['Costos', 3], ['Derecho Comercial', 3], ['Contabilidad Financiera', 4],
      ['Legislación Tributaria', 5], ['Normas Internacionales de Información Financiera', 5], ['Auditoría', 6],
      ['Revisoría Fiscal', 7], ['Finanzas', 7], ['Contabilidad Pública', 8],
    ],
  },
  economia: {
    icon: 'chart-line',
    subjects: [
      ['Introducción a la Economía', 1], ['Matemáticas Básicas', 1], ['Microeconomía', 2], ['Cálculo', 2],
      ['Macroeconomía', 3], ['Estadística', 3], ['Historia Económica', 4], ['Econometría', 5],
      ['Economía Internacional', 6], ['Economía Pública', 6], ['Desarrollo Económico', 7], ['Economía Regional', 8],
    ],
  },
  negocios_int: {
    icon: 'earth',
    subjects: [
      ['Fundamentos de Negocios Internacionales', 1], ['Fundamentos de Administración', 1], ['Microeconomía', 2],
      ['Geografía Económica', 2], ['Comercio Internacional', 3], ['Logística Internacional', 4],
      ['Legislación Aduanera', 4], ['Mercadeo Internacional', 5], ['Finanzas Internacionales', 6],
      ['Negociación Internacional', 7], ['Inteligencia de Mercados', 8],
    ],
  },
  tec_comercial: {
    icon: 'cash-register',
    subjects: [
      ['Fundamentos de Administración', 1], ['Contabilidad Básica', 1], ['Matemática Financiera', 2],
      ['Técnicas de Venta', 3], ['Gestión Financiera', 4], ['Servicio al Cliente', 4], ['Proyecto Comercial', 6],
    ],
  },
  tec_comercio_int: {
    icon: 'truck-cargo-container',
    subjects: [
      ['Fundamentos de Comercio Internacional', 1], ['Contabilidad Básica', 1], ['Legislación Aduanera', 2],
      ['Logística Internacional', 3], ['Régimen Cambiario', 4], ['Procesos de Importación y Exportación', 5],
      ['Proyecto de Comercio Exterior', 6],
    ],
  },

  // --- Facultad de Ciencias Sociales y Humanas ---
  derecho: {
    icon: 'scale-balance',
    subjects: [
      ['Introducción al Derecho', 1], ['Derecho Romano', 1], ['Derecho Constitucional', 2], ['Derecho Civil: Personas', 2],
      ['Derecho Civil: Bienes', 3], ['Derecho Penal General', 3], ['Derecho Civil: Obligaciones', 4],
      ['Derecho Penal Especial', 4], ['Derecho Administrativo', 5], ['Derecho Procesal Civil', 5],
      ['Derecho Laboral', 6], ['Derecho Comercial', 6], ['Derecho Procesal Penal', 7], ['Derecho de Familia', 7],
      ['Derecho Internacional', 8], ['Consultorio Jurídico', 9],
    ],
  },
  psicologia: {
    icon: 'head-heart-outline',
    subjects: [
      ['Introducción a la Psicología', 1], ['Biología Humana', 1], ['Procesos Psicológicos Básicos', 2],
      ['Psicofisiología', 2], ['Psicología del Desarrollo', 3], ['Estadística', 3], ['Teorías de la Personalidad', 4],
      ['Psicometría', 4], ['Psicopatología', 5], ['Psicología Social', 5], ['Evaluación Psicológica', 6],
      ['Psicología Clínica', 7], ['Psicología Organizacional', 7], ['Psicología Educativa', 8], ['Práctica Profesional', 9],
    ],
  },
  trabajo_social: {
    icon: 'account-group',
    subjects: [
      ['Fundamentos del Trabajo Social', 1], ['Sociología', 1], ['Antropología', 2], ['Trabajo Social con Casos', 3],
      ['Trabajo Social con Grupos', 4], ['Trabajo Social Comunitario', 5], ['Política Social', 5],
      ['Familia y Sociedad', 6], ['Gerencia Social', 7], ['Práctica Profesional', 8],
    ],
  },
  comunicacion: {
    icon: 'microphone-variant',
    subjects: [
      ['Teorías de la Comunicación', 1], ['Expresión Oral y Escrita', 1], ['Semiótica', 2], ['Fotografía', 2],
      ['Periodismo Informativo', 3], ['Radio', 4], ['Comunicación Organizacional', 4], ['Producción Audiovisual', 5],
      ['Periodismo Digital', 6], ['Comunicación para el Desarrollo', 7], ['Opinión Pública', 7], ['Práctica Profesional', 8],
    ],
  },

  // --- Facultad de Ciencias de la Educación ---
  lic_etnoeducacion: {
    icon: 'account-group-outline',
    subjects: [
      ['Fundamentos de la Etnoeducación', 1], ['Lengua y Cultura Wayuunaiki', 1], ['Antropología Cultural', 2],
      ['Pedagogía y Didáctica General', 2], ['Interculturalidad', 3], ['Historia de La Guajira', 3],
      ['Currículo Propio', 4], ['Didáctica de la Lengua Materna', 5], ['Legislación Etnoeducativa', 6],
      ['Investigación Educativa', 7], ['Práctica Pedagógica', 8],
    ],
  },
  lic_infantil: {
    icon: 'teddy-bear',
    subjects: [
      ['Fundamentos de la Educación Infantil', 1], ['Psicología del Desarrollo Infantil', 1], ['Pedagogía', 2],
      ['Literatura Infantil', 3], ['Didáctica de la Lectura y la Escritura', 3], ['Lúdica y Juego', 4],
      ['Didáctica de las Matemáticas', 5], ['Necesidades Educativas Especiales', 6], ['Evaluación Educativa', 7],
      ['Práctica Pedagógica', 8],
    ],
  },
  lic_edufisica: {
    icon: 'run',
    subjects: [
      ['Fundamentos de la Educación Física', 1], ['Anatomía Funcional', 1], ['Fisiología del Ejercicio', 2],
      ['Atletismo', 2], ['Gimnasia', 3], ['Deportes de Conjunto', 3], ['Biomecánica', 4], ['Recreación', 4],
      ['Teoría del Entrenamiento Deportivo', 5], ['Didáctica de la Educación Física', 6], ['Actividad Física y Salud', 7],
      ['Práctica Pedagógica', 8],
    ],
  },
  lic_musica: {
    icon: 'music',
    subjects: [
      ['Teoría Musical', 1], ['Gramática Musical', 1], ['Instrumento Principal', 2], ['Armonía', 2],
      ['Historia de la Música', 3], ['Música Vallenata', 3], ['Contrapunto', 4], ['Dirección Coral', 5],
      ['Didáctica de la Música', 6], ['Arreglos Musicales', 7], ['Práctica Pedagógica', 8],
    ],
  },
  lic_ciencias_soc: {
    icon: 'earth',
    subjects: [
      ['Introducción a las Ciencias Sociales', 1], ['Historia Universal', 1], ['Geografía General', 2],
      ['Historia de Colombia', 3], ['Sociología', 3], ['Economía Política', 4], ['Constitución y Democracia', 5],
      ['Didáctica de las Ciencias Sociales', 6], ['Historia de La Guajira', 6], ['Investigación Social', 7],
      ['Práctica Pedagógica', 8],
    ],
  },
  lic_espanol: {
    icon: 'book-open-variant',
    subjects: [
      ['Lingüística General', 1], ['Comprensión y Producción Textual', 1], ['Gramática del Español', 2],
      ['Literatura Universal', 3], ['Fonética y Fonología', 3], ['Literatura Latinoamericana', 4],
      ['Semántica', 5], ['Literatura Colombiana', 5], ['Didáctica de la Lengua', 6], ['Sociolingüística', 7],
      ['Práctica Pedagógica', 8],
    ],
  },
  lic_primaria: {
    icon: 'school-outline',
    subjects: [
      ['Pedagogía General', 1], ['Psicología del Aprendizaje', 1], ['Didáctica de la Lengua', 2],
      ['Didáctica de las Matemáticas', 3], ['Didáctica de las Ciencias Naturales', 4], ['Etnoeducación', 4],
      ['Didáctica de las Ciencias Sociales', 5], ['Evaluación del Aprendizaje', 6], ['Investigación Educativa', 7],
      ['Práctica Pedagógica', 8],
    ],
  },

  // --- Facultad de Ciencias Básicas y Aplicadas ---
  biologia: {
    icon: 'dna',
    subjects: [
      ['Biología General', 1], ['Química General', 1], ['Biología Celular y Molecular', 2], ['Química Orgánica', 2],
      ['Botánica', 3], ['Zoología de Invertebrados', 3], ['Bioquímica', 4], ['Microbiología', 4], ['Genética', 5],
      ['Ecología', 5], ['Zoología de Vertebrados', 6], ['Fisiología Animal', 6], ['Evolución', 7],
      ['Biodiversidad del Bosque Seco', 8],
    ],
  },
  quimica: {
    icon: 'flask',
    subjects: [
      ['Química General', 1], ['Cálculo Diferencial', 1], ['Química Inorgánica', 2], ['Física', 2],
      ['Química Orgánica I', 3], ['Química Analítica', 3], ['Química Orgánica II', 4], ['Fisicoquímica', 4],
      ['Análisis Instrumental', 5], ['Bioquímica', 6], ['Química Ambiental', 7], ['Química de Productos Naturales', 8],
    ],
  },
  agroecologia: {
    icon: 'sprout',
    subjects: [
      ['Introducción a la Agroecología', 1], ['Biología General', 1], ['Edafología', 2], ['Química de Suelos', 3],
      ['Botánica', 3], ['Fisiología Vegetal', 4], ['Agroclimatología', 4], ['Manejo Integrado de Plagas', 5],
      ['Sistemas Agroforestales', 6], ['Producción Pecuaria Sostenible', 6], ['Desarrollo Rural', 7],
      ['Soberanía Alimentaria', 8],
    ],
  },

  // --- Facultad de Ciencias de la Salud ---
  medicina: {
    icon: 'stethoscope',
    subjects: [
      ['Biología Celular', 1], ['Química Médica', 1], ['Anatomía Humana I', 2], ['Histología', 2],
      ['Embriología', 2], ['Anatomía Humana II', 3], ['Bioquímica Médica', 3], ['Fisiología', 4],
      ['Neuroanatomía', 4], ['Microbiología y Parasitología', 4], ['Inmunología', 5], ['Patología General', 5],
      ['Farmacología', 6], ['Semiología', 6], ['Epidemiología', 6], ['Medicina Interna', 7],
      ['Pediatría', 8], ['Cirugía General', 9], ['Ginecología y Obstetricia', 9], ['Psiquiatría', 10],
      ['Salud Pública', 10], ['Medicina Familiar y Comunitaria', 11], ['Internado Rotatorio', 12],
    ],
  },
  enfermeria: {
    icon: 'medical-bag',
    subjects: [
      ['Fundamentos de Enfermería', 1], ['Biología Humana', 1], ['Anatomía y Fisiología', 2], ['Bioquímica', 2],
      ['Microbiología', 3], ['Farmacología', 3], ['Cuidado del Adulto', 4], ['Salud Comunitaria', 4],
      ['Cuidado Materno Perinatal', 5], ['Cuidado del Niño y el Adolescente', 6], ['Salud Mental', 6],
      ['Cuidado Crítico', 7], ['Gerencia en Enfermería', 8], ['Práctica Integral', 9],
    ],
  },
  nutricion: {
    icon: 'food-apple',
    subjects: [
      ['Introducción a la Nutrición', 1], ['Química General', 1], ['Anatomía y Fisiología', 2], ['Bioquímica', 2],
      ['Bromatología', 3], ['Nutrición Humana', 3], ['Técnicas Dietéticas', 4], ['Evaluación Nutricional', 4],
      ['Dietoterapia', 5], ['Nutrición Materno Infantil', 6], ['Nutrición en Salud Pública', 6],
      ['Seguridad Alimentaria', 7], ['Servicios de Alimentación', 8],
    ],
  },
  seguridad_salud: {
    icon: 'hard-hat',
    subjects: [
      ['Fundamentos de Seguridad y Salud en el Trabajo', 1], ['Anatomía y Fisiología', 1], ['Legislación Laboral', 2],
      ['Higiene Industrial', 3], ['Seguridad Industrial', 3], ['Medicina del Trabajo', 4], ['Ergonomía', 4],
      ['Toxicología Ocupacional', 5], ['Gestión del Riesgo', 6], ['Sistema de Gestión de SST', 7],
      ['Auditoría en SST', 8],
    ],
  },

  // --- Facultad de Artes Integradas ---
  arquitectura: {
    icon: 'home-city-outline',
    subjects: [
      ['Taller de Diseño I', 1], ['Dibujo Arquitectónico', 1], ['Geometría Descriptiva', 2], ['Historia de la Arquitectura', 2],
      ['Taller de Diseño II', 3], ['Materiales y Construcción', 3], ['Estructuras', 4], ['Urbanismo', 5],
      ['Arquitectura Bioclimática', 6], ['Instalaciones', 6], ['Arquitectura Vernácula Wayuu', 7],
      ['Gestión de Proyectos Arquitectónicos', 8],
    ],
  },
};
