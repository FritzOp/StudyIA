/**
 * Catálogo Académico e Institucional Oficial - Universidad de La Guajira (Uniguajira)
 * Información exhaustiva extraída de fuentes oficiales (uniguajira.edu.co):
 * - Historia, Misión, Visión 2030, Valores y Principios Institucionales
 * - Sedes y Extensiones Regionales
 * - Oferta Completa de Pregrados (7 Facultades y Carreras Profesionales/Tecnológicas)
 * - Posgrados (Doctorados, Maestrías, Especializaciones)
 * - Diplomados y Educación Continuada / Extensión
 * - Asignaturas Generales y Específicas del Componente Curricular
 */

export const uniguajiraInstitutionalInfo = {
  name: 'Universidad de La Guajira',
  acronym: 'Uniguajira',
  slogan: 'Acreditada Institucionalmente • Ciencia, Tecnología e Interculturalidad',
  foundation: '12 de noviembre de 1976 (Decreto 523 en cumplimiento de las Ordenanzas 011 y 022 de 1975)',
  ministerialRecognition: 'Resolución No. 1770 del 24 de junio de 1995 (MEN)',
  nature: 'Ente universitario autónomo de carácter estatal, de servicio público cultural, pluralista y humanista.',
  headquarters: 'Riohacha, La Guajira, Colombia (Km 3+354 Vía Maicao, Ciudadela Universitaria)',
  website: 'https://uniguajira.edu.co',
  mission:
    'Formar profesionales íntegros que perciban, aprehendan, generen, apliquen y transformen saberes y conocimientos en un marco de diversidad cultural a través de las actividades que le son propias (docencia, investigación, proyección social y extensión) para satisfacer las necesidades de desarrollo sostenible y sustentable de la sociedad guajira y de su entorno, con especial énfasis en el autorreconocimiento de las condiciones de multiculturalidad con miras a alcanzar condiciones de interculturalidad.',
  vision2030:
    'Para 2030, la Universidad de La Guajira será el centro de la cultura regional, con reconocimiento local, nacional e internacional por el logro de la Acreditación de calidad de sus programas académicos e institucional; formadora de personas íntegras, dedicadas, con vocación y compromiso al servicio social a través de la docencia y la investigación, comprometidas con la generación y aplicación ética de la ciencia a la solución de problemas del entorno.',
  coreValues: [
    'Honestidad (Principio rector institucional)',
    'Tolerancia y Convivencia Intercultural',
    'Ecuanimidad y Rigurosidad Científica',
    'Transparencia y Austeridad',
    'Solidaridad y Sentido de Pertenencia',
    'Equidad Social y Lealtad a la Región',
  ],
};

export const uniguajiraCampuses = [
  {
    id: 'riohacha',
    name: 'Sede Principal Riohacha',
    type: 'Campus Universitario Central',
    address: 'Km 3+354 Vía Maicao, Ciudadela Universitaria',
    city: 'Riohacha',
    description: 'Sede administrativa central, biblioteca central, laboratorios de investigación y complejo deportivo.',
    icon: 'school',
  },
  {
    id: 'maicao',
    name: 'Sede Maicao',
    type: 'Sede Regional Fronteriza',
    address: 'Calle 16 No. 28A-80 (Salida a Riohacha)',
    city: 'Maicao',
    description: 'Enfoque en comercio internacional, logística fronteriza y programas empresariales binacionales.',
    icon: 'domain',
  },
  {
    id: 'fonseca',
    name: 'Sede Fonseca',
    type: 'Sede Regional Sur de La Guajira',
    address: 'Km 2 Vía Barrancas',
    city: 'Fonseca',
    description: 'Sede articuladora del centro y sur del departamento, con oferta en ciencias agropecuarias e ingeniería.',
    icon: 'office-building',
  },
  {
    id: 'villanueva',
    name: 'Sede Villanueva',
    type: 'Sede Regional Musical y Cultural',
    address: 'Km 1 Vía San Juan del Cesar',
    city: 'Villanueva',
    description: 'Cuna de la Licenciatura en Música, preservación del patrimonio vallenato y ciencias humanas.',
    icon: 'music',
  },
  {
    id: 'manaure',
    name: 'Extensión Manaure',
    type: 'Extensión Intercultural',
    address: 'Sector Cultural y Académico de Manaure',
    city: 'Manaure',
    description: 'Centro clave para la formación docente en Licenciatura en Básica Primaria e impacto en comunidades Wayuu salineras.',
    icon: 'water-percent',
  },
  {
    id: 'uribia',
    name: 'Extensión Uribia',
    type: 'Extensión Capital Indígena',
    address: 'Centro Educativo Intercultural Uribia',
    city: 'Uribia',
    description: 'Sede en la Capital Indígena de Colombia con programas adaptados a la etnoeducación y bilingüismo español-wayuunaiki.',
    icon: 'account-group',
  },
];

export const uniguajiraFaculties = [
  {
    id: 'ingenieria',
    name: 'Facultad de Ingeniería',
    icon: 'laptop',
    color: '#6366F1',
    description: 'Formación de ingenieros y tecnólogos líderes en innovación, TIC, energías limpias y desarrollo de infraestructura.',
    programs: [
      { id: 'sistemas', name: 'Ingeniería de Sistemas', code: 'ING-SIS', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'industrial', name: 'Ingeniería Industrial', code: 'ING-IND', degree: 'Pregrado Profesional', credits: 165 },
      { id: 'ambiental', name: 'Ingeniería Ambiental', code: 'ING-AMB', degree: 'Pregrado Profesional', credits: 162 },
      { id: 'civil', name: 'Ingeniería Civil', code: 'ING-CIV', degree: 'Pregrado Profesional', credits: 170 },
      { id: 'mecanica', name: 'Ingeniería Mecánica', code: 'ING-MEC', degree: 'Pregrado Profesional', credits: 168 },
      { id: 'energias', name: 'Ingeniería en Energías', code: 'ING-ENE', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'tec_software', name: 'Tecnología en Desarrollo de Software', code: 'TEC-DSW', degree: 'Tecnología', credits: 96 },
      { id: 'tec_redes', name: 'Tecnología en Gestión de Redes Informáticas', code: 'TEC-RED', degree: 'Tecnología', credits: 98 },
      { id: 'tec_energias', name: 'Tecnología en Gestión de Energías Renovables', code: 'TEC-ENR', degree: 'Tecnología', credits: 96 },
    ],
  },
  {
    id: 'economicas',
    name: 'Facultad de Ciencias Económicas y Administrativas',
    icon: 'chart-line',
    color: '#06B6D4',
    description: 'Gestión empresarial, finanzas corporativas, economía regional y logística marítima portuaria.',
    programs: [
      { id: 'admin_empresas', name: 'Administración de Empresas', code: 'ADM-EMP', degree: 'Pregrado Profesional', credits: 155 },
      { id: 'admin_maritima', name: 'Administración Marítima y Portuaria', code: 'ADM-MAR', degree: 'Pregrado Profesional', credits: 158 },
      { id: 'admin_publica', name: 'Administración Pública por Ciclos Propedéuticos', code: 'ADM-PUB', degree: 'Pregrado Profesional', credits: 150 },
      { id: 'admin_turistica', name: 'Administración Turística y Hotelera', code: 'ADM-TUR', degree: 'Pregrado Profesional', credits: 152 },
      { id: 'contaduria', name: 'Contaduría Pública', code: 'CON-PUB', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'economia', name: 'Economía', code: 'ECO-GEN', degree: 'Pregrado Profesional', credits: 156 },
      { id: 'negocios_int', name: 'Negocios Internacionales', code: 'NEG-INT', degree: 'Pregrado Profesional', credits: 154 },
      { id: 'tec_comercial', name: 'Tecnología en Gestión Comercial y Financiera', code: 'TEC-GCF', degree: 'Tecnología', credits: 96 },
      { id: 'tec_comercio_int', name: 'Tecnología en Gestión de Comercio Internacional', code: 'TEC-GCI', degree: 'Tecnología', credits: 96 },
    ],
  },
  {
    id: 'sociales',
    name: 'Facultad de Ciencias Sociales y Humanas',
    icon: 'scale-balance',
    color: '#EC4899',
    description: 'Defensa de los derechos humanos, mediación jurídica, tejido psicosocial y comunicación dialógica.',
    programs: [
      { id: 'derecho', name: 'Derecho', code: 'DER-GEN', degree: 'Pregrado Profesional', credits: 170 },
      { id: 'psicologia', name: 'Psicología', code: 'PSI-GEN', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'trabajo_social', name: 'Trabajo Social', code: 'TRB-SOC', degree: 'Pregrado Profesional', credits: 158 },
      { id: 'comunicacion', name: 'Comunicación Social', code: 'COM-SOC', degree: 'Pregrado Profesional', credits: 155 },
    ],
  },
  {
    id: 'educacion',
    name: 'Facultad de Ciencias de la Educación',
    icon: 'school',
    color: '#F59E0B',
    description: 'Líder en etnoeducación, pedagogía diversa, formación de maestros interculturales y preservación de expresiones artísticas.',
    programs: [
      { id: 'lic_etnoeducacion', name: 'Licenciatura en Etnoeducación e Interculturalidad', code: 'LIC-ETN', degree: 'Licenciatura', credits: 160 },
      { id: 'lic_infantil', name: 'Licenciatura en Educación Infantil', code: 'LIC-INF', degree: 'Licenciatura', credits: 158 },
      { id: 'lic_edufisica', name: 'Licenciatura en Educación Física, Recreación y Deporte', code: 'LIC-EDF', degree: 'Licenciatura', credits: 162 },
      { id: 'lic_musica', name: 'Licenciatura en Música (Sede Villanueva)', code: 'LIC-MUS', degree: 'Licenciatura', credits: 165 },
      { id: 'lic_ciencias_soc', name: 'Licenciatura en Ciencias Sociales', code: 'LIC-CSO', degree: 'Licenciatura', credits: 160 },
      { id: 'lic_espanol', name: 'Licenciatura en Español y Humanidades', code: 'LIC-ESP', degree: 'Licenciatura', credits: 160 },
      { id: 'lic_primaria', name: 'Licenciatura en Educación Básica Primaria (Sedes Manaure / Uribia)', code: 'LIC-PRI', degree: 'Licenciatura', credits: 156 },
    ],
  },
  {
    id: 'basicas',
    name: 'Facultad de Ciencias Básicas y Aplicadas',
    icon: 'flask',
    color: '#10B981',
    description: 'Investigación en biodiversidad del bosque seco tropical, química ambiental y sustentabilidad agroecológica.',
    programs: [
      { id: 'biologia', name: 'Biología', code: 'BIO-GEN', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'quimica', name: 'Química', code: 'QUI-GEN', degree: 'Pregrado Profesional', credits: 162 },
      { id: 'agroecologia', name: 'Agroecología', code: 'AGR-ECO', degree: 'Pregrado Profesional', credits: 158 },
    ],
  },
  {
    id: 'salud',
    name: 'Facultad de Ciencias de la Salud',
    icon: 'heart-pulse',
    color: '#EF4444',
    description: 'Salud comunitaria integral con enfoque étnico y preventivo, bienestar nutricional y seguridad ocupacional.',
    programs: [
      { id: 'medicina', name: 'Medicina', code: 'MED-GEN', degree: 'Pregrado Profesional', credits: 280 },
      { id: 'enfermeria', name: 'Enfermería', code: 'ENF-GEN', degree: 'Pregrado Profesional', credits: 164 },
      { id: 'nutricion', name: 'Nutrición y Dietética', code: 'NUT-DIE', degree: 'Pregrado Profesional', credits: 160 },
      { id: 'seguridad_salud', name: 'Seguridad y Salud en el Trabajo', code: 'SST-GEN', degree: 'Pregrado Profesional', credits: 155 },
    ],
  },
  {
    id: 'artes',
    name: 'Facultad de Artes Integradas',
    icon: 'palette',
    color: '#8B5CF6',
    description: 'Diseño arquitectónico bioclimático, urbanismo territorial sostenible y preservación de saberes constructivos vernáculos.',
    programs: [
      { id: 'arquitectura', name: 'Arquitectura', code: 'ARQ-GEN', degree: 'Pregrado Profesional', credits: 172 },
    ],
  },
];

export const uniguajiraPostgraduates = [
  // Doctorados
  {
    id: 'doc_innovacion',
    name: 'Doctorado en Innovación',
    type: 'Doctorado',
    faculty: 'Facultad de Ingeniería',
    desc: 'Investigación doctoral de frontera en transformación tecnológica e innovación industrial.',
  },
  {
    id: 'doc_ciencias_soc',
    name: 'Doctorado en Ciencias Sociales',
    type: 'Doctorado',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Estudio crítico de los fenómenos sociales, territorialidad y dinámicas interculturales.',
  },

  // Maestrías
  {
    id: 'mst_tec_innovacion',
    name: 'Maestría en Gestión de la Tecnología y la Innovación',
    type: 'Maestría',
    faculty: 'Facultad de Ingeniería',
    desc: 'Estrategias de adopción tecnológica, I+D+i y vigilancia tecnológica.',
  },
  {
    id: 'mst_mba',
    name: 'Maestría en Administración de Empresas (MBA)',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Liderazgo empresarial global, toma de decisiones gerenciales y competitividad.',
  },
  {
    id: 'mst_negocios_int',
    name: 'Maestría en Administración de Negocios Internacionales',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Comercio global, cadenas logísticas transfronterizas y tratados económicos.',
  },
  {
    id: 'mst_ciencias_soc',
    name: 'Maestría en Ciencias Sociales',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Investigación cualitativa sobre políticas públicas, comunidades étnicas y memoria histórica.',
  },
  {
    id: 'mst_comunicativos',
    name: 'Maestría en Desarrollo de Procesos Comunicativos en Educación: Lectoescritura',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Didáctica de la lengua, oralidad, lectura crítica y semiótica en contextos multiculturales.',
  },
  {
    id: 'mst_familia',
    name: 'Maestría en Familia e Intervención Familiar',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Abordaje sistémico familiar, intervención comunitaria y mediación de conflictos vinculares.',
  },
  {
    id: 'mst_finanzas',
    name: 'Maestría en Finanzas',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Mercados de capitales, valoración de empresas, riesgos financieros y finanzas públicas.',
  },
  {
    id: 'mst_mercadeo',
    name: 'Maestría en Gerencia Estratégica de Mercadeo',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Marketing digital, comportamiento del consumidor y posicionamiento de marcas regionales.',
  },
  {
    id: 'mst_cambio_climatico',
    name: 'Maestría en Gestión Integral frente al Cambio Climático',
    type: 'Maestría',
    faculty: 'Facultad de Ingeniería',
    desc: 'Mitigación ambiental, gobernanza climática, huella de carbono y energías no convencionales.',
  },
  {
    id: 'mst_turismo_sost',
    name: 'Maestría en Gestión y Desarrollo Turístico Sostenible',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Ecoturismo comunitario, patrimonio biocultural y desarrollo territorial sostenible.',
  },
  {
    id: 'mst_gerencia_edu',
    name: 'Maestría en Gestión y Gerencia Educativa',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Dirección de instituciones formativas, aseguramiento de la calidad y liderazgo docente.',
  },
  {
    id: 'mst_pedagogia_tic',
    name: 'Maestría en Pedagogía de las Tecnologías de la Información y la Comunicación',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Mediaciones pedagógicas virtuales, diseño instruccional y recursos educativos digitales.',
  },
  {
    id: 'mst_alta_gerencia',
    name: 'Maestría en Alta Gerencia e Innovación Organizacional',
    type: 'Maestría',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Direccionamiento estratégico, cultura organizacional ágil y transformación de negocios.',
  },

  // Especializaciones
  {
    id: 'esp_gerencia_const',
    name: 'Especialización en Gerencia de Construcciones',
    type: 'Especialización',
    faculty: 'Facultad de Ingeniería',
    desc: 'Planificación, costos, interventoría y control técnico de obras de ingeniería civil.',
  },
  {
    id: 'esp_servicios_salud',
    name: 'Especialización en Gerencia de Servicios de Salud',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias de la Salud',
    desc: 'Gestión hospitalaria, calidad en el servicio y administración de redes prestadoras de salud.',
  },
  {
    id: 'esp_resolucion_conflictos',
    name: 'Especialización en Resolución de Conflictos',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Conciliación en derecho, justicia restaurativa y diálogo comunitario intercultural.',
  },
  {
    id: 'esp_gerencia_estrategica',
    name: 'Especialización en Gerencia Estratégica',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Estrategia corporativa, ventaja competitiva y prospectiva empresarial.',
  },
  {
    id: 'esp_tributaria',
    name: 'Especialización en Gerencia Tributaria',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Planeación fiscal, régimen aduanero y normatividad tributaria colombiana.',
  },
  {
    id: 'esp_gerencia_proyectos',
    name: 'Especialización en Gerencia de Proyectos',
    type: 'Especialización',
    faculty: 'Facultad de Ingeniería',
    desc: 'Metodologías PMI/Scrum, estructuración de proyectos de inversión y gestión del riesgo.',
  },
  {
    id: 'esp_sistemas_energeticos',
    name: 'Especialización en Sistemas Energéticos Sostenibles',
    type: 'Especialización',
    faculty: 'Facultad de Ingeniería',
    desc: 'Energía solar fotovoltaica, parques eólicos y transición energética en la península.',
  },
  {
    id: 'esp_entrenamiento_dep',
    name: 'Especialización en Entrenamiento Deportivo',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Fisiología del esfuerzo, planificación de atletas de alto rendimiento y biomecánica.',
  },
  {
    id: 'esp_fronteras',
    name: 'Especialización en Estudios Fronterizos (Sede Maicao)',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Geopolítica de frontera colombo-venezolana, migraciones y dinámicas aduaneras.',
  },
  {
    id: 'esp_innovacion_pedagogica',
    name: 'Especialización en Innovación Pedagógica',
    type: 'Especialización',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Nuevos enfoques curriculares, tecnologías educativas y aprendizaje significativo.',
  },
];

export const uniguajiraDiplomas = [
  {
    id: 'dip_ed_diversa',
    name: 'Competencias de la Educación Diversa en la Primera Infancia',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Estrategias inclusivas para la atención integral y pedagógica en primera infancia.',
    hours: 120,
  },
  {
    id: 'dip_didactica_deporte',
    name: 'Didáctica y Pedagogía de Entrenamiento Deportivo Contemporáneo',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Nuevas tendencias del entrenamiento físico y didáctica aplicada al deporte formativo.',
    hours: 120,
  },
  {
    id: 'dip_etno_enfoque',
    name: 'La Etnoeducación: Un Enfoque Pedagógico para la Diversidad Intercultural',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Cosmovisión, diálogo de saberes y contextualización curricular en comunidades étnicas.',
    hours: 140,
  },
  {
    id: 'dip_etno_investigacion',
    name: 'Etnoeducación, Interculturalidad y Epistemología de la Investigación en Contexto',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Investigación-acción participativa aplicada a contextos indígenas y afrodescendientes.',
    hours: 120,
  },
  {
    id: 'dip_atencion_infancia',
    name: 'Fortalecimiento de las Competencias para la Atención Integral en la Primera Infancia',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Desarrollo infantil temprano, nutrición, apego seguro y estimulación adecuada.',
    hours: 120,
  },
  {
    id: 'dip_interculturalidad_etnoped',
    name: 'La Interculturalidad y la Etnopedagogía',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Modelos etnopedagógicos y articulación con los Proyectos Educativos Comunitarios (PEC).',
    hours: 120,
  },
  {
    id: 'dip_lineamientos_infancia',
    name: 'Lineamientos Curriculares en el Marco de la Atención a la Primera Infancia',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Políticas públicas de primera infancia, juego, arte y exploración del medio.',
    hours: 120,
  },
  {
    id: 'dip_multiculturalidad_etno',
    name: 'Multiculturalidad: Eje Principal de la Etnoeducación',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias de la Educación',
    desc: 'Reconocimiento de las identidades culturales Wayuu, Wiwa, Kogui y afroguajiras.',
    hours: 120,
  },
  {
    id: 'dip_orientacion_familiar',
    name: 'Orientación Familiar, Desde un Enfoque Integral',
    area: 'Ciencias Exactas e Infancia',
    faculty: 'Facultad de Ciencias Sociales y Humanas',
    desc: 'Acompañamiento a pautas de crianza, resolución no violenta de conflictos y vínculos parentales.',
    hours: 120,
  },
  {
    id: 'dip_gestion_innovacion_emp',
    name: 'Gestión de la Innovación Empresarial',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Modelos de innovación disruptiva, Design Thinking y creación de ventajas competitivas.',
    hours: 120,
  },
  {
    id: 'dip_turismo_sostenible',
    name: 'Gestión de la Innovación y Desarrollo Turístico Sostenible',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Emprendimiento turístico ecológico y puesta en valor del patrimonio guajiro.',
    hours: 120,
  },
  {
    id: 'dip_gestion_financiera',
    name: 'Gestión Financiera',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Análisis financiero aplicado, tesorería, flujo de caja y decisiones de inversión.',
    hours: 120,
  },
  {
    id: 'dip_gastronomia_finanzas',
    name: 'Gestión Financiera en Establecimientos de Servicios Gastronómicos',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Estructuración de costos de recetas, mermas, fijación de precios y rentabilidad en restaurantes.',
    hours: 100,
  },
  {
    id: 'dip_marketing_estrategico',
    name: 'Marketing Estratégico Competitivo',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Branding, analítica de datos comerciales y campañas efectivas de mercadeo omnicanal.',
    hours: 120,
  },
  {
    id: 'dip_niif_pymes',
    name: 'Normas Internacionales de Información Financiera (NIIF) para Pymes y Cambios en el Marco Conceptual',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Aplicación práctica de estándares contables internacionales IFRS en pequeñas y medianas empresas.',
    hours: 120,
  },
  {
    id: 'dip_prospectiva_estrategica',
    name: 'Prospectiva como Estrategia para la Gestión Administrativa y Financiera en las Organizaciones',
    area: 'Administración, Negocios y Finanzas',
    faculty: 'Facultad de Ciencias Económicas y Administrativas',
    desc: 'Construcción de escenarios futuros, método Delphi y planificación estratégica preventiva.',
    hours: 120,
  },
  {
    id: 'dip_industria_5_0',
    name: 'Tecnologías Emergentes para la Industria 5.0 e Inteligencia Artificial',
    area: 'Ingeniería y Tecnologías Emergentes',
    faculty: 'Facultad de Ingeniería',
    desc: 'Internet de las Cosas (IoT), automatización inteligente, robótica colaborativa e IA generativa.',
    hours: 140,
  },
  {
    id: 'dip_recurso_hidrico',
    name: 'Gestión Integral del Recurso Hídrico y Mitigación del Riesgo',
    area: 'Ingeniería y Ciencias Ambientales',
    faculty: 'Facultad de Ingeniería',
    desc: 'Desalinización, captación de aguas de niebla, pozos profundos y gobernanza del agua en La Guajira.',
    hours: 120,
  },
];

export const uniguajiraCurriculumSubjects = [
  // 1. Ciencias Básicas y Matemáticas
  { name: 'Cálculo Diferencial', code: 'MAT-101', area: 'Ciencias Básicas', desc: 'Límites, continuidad, derivadas y aplicaciones de razones de cambio.', icon: 'calculator' },
  { name: 'Cálculo Integral', code: 'MAT-201', area: 'Ciencias Básicas', desc: 'Integrales definidas, métodos de integración, cálculo de volúmenes y series.', icon: 'calculator-variant' },
  { name: 'Cálculo Multivariado', code: 'MAT-301', area: 'Ciencias Básicas', desc: 'Funciones de varias variables, derivadas parciales e integrales dobles y triples.', icon: 'function-variant' },
  { name: 'Ecuaciones Diferenciales', code: 'MAT-401', area: 'Ciencias Básicas', desc: 'Modelado analítico y numérico de sistemas dinámicos y transformadas de Laplace.', icon: 'math-compass' },
  { name: 'Álgebra Lineal', code: 'MAT-102', area: 'Ciencias Básicas', desc: 'Vectores, matrices, determinantes, espacios vectoriales y transformaciones lineales.', icon: 'matrix' },
  { name: 'Matemáticas Discretas', code: 'MAT-202', area: 'Ciencias Básicas', desc: 'Lógica proposicional, teoría de conjuntos, grafos, combinatoria y máquinas de estado.', icon: 'graph-outline' },
  { name: 'Estadística Descriptiva', code: 'EST-101', area: 'Ciencias Básicas', desc: 'Muestreo, distribuciones de frecuencias, medidas de tendencia central y dispersión.', icon: 'chart-bar' },
  { name: 'Estadística Inferencial', code: 'EST-201', area: 'Ciencias Básicas', desc: 'Pruebas de hipótesis, intervalos de confianza, análisis de varianza y regresión lineal.', icon: 'chart-bell-curve' },
  { name: 'Física Mecánica', code: 'FIS-101', area: 'Ciencias Básicas', desc: 'Cinemática, leyes del movimiento de Newton, trabajo, energía y momento lineal.', icon: 'atom' },
  { name: 'Física Electromagnética', code: 'FIS-201', area: 'Ciencias Básicas', desc: 'Campos eléctricos, ley de Gauss, circuitos de corriente, magnetismo e inducción de Faraday.', icon: 'lightning-bolt-circle' },
  { name: 'Química General', code: 'QUI-101', area: 'Ciencias Básicas', desc: 'Estructura atómica, enlaces moleculares, estequiometría, termodinámica y soluciones.', icon: 'flask-round-bottom' },
  { name: 'Biología Celular y Molecular', code: 'BIO-101', area: 'Ciencias Básicas', desc: 'Organización celular procariota/eucariota, síntesis proteica, metabolismo y genética básica.', icon: 'dna' },

  // 2. Ingeniería y Tecnologías de la Información
  { name: 'Introducción a la Ingeniería', code: 'ING-100', area: 'Ingeniería', desc: 'Fundamentos de la profesión, metodología de diseño, resolución de problemas y ética ingenieril.', icon: 'compass-outline' },
  { name: 'Algoritmografía y Programación', code: 'SIS-101', area: 'Ingeniería', desc: 'Lógica algorítmica, diagramación de flujo, pseudocódigo y sintaxis elemental.', icon: 'code-tags' },
  { name: 'Programación Orientada a Objetos', code: 'SIS-201', area: 'Ingeniería', desc: 'Clases, herencia, encapsulamiento, polimorfismo, interfaces y diseño modular.', icon: 'cube-outline' },
  { name: 'Estructuras de Datos', code: 'SIS-202', area: 'Ingeniería', desc: 'Pilas, colas, listas doblemente enlazadas, árboles binarios, grafos y complejidad algorítmica.', icon: 'file-tree' },
  { name: 'Bases de Datos', code: 'SIS-301', area: 'Ingeniería', desc: 'Modelado entidad-relación, formas normales, lenguaje SQL, transacciones ACID y bases NoSQL.', icon: 'database' },
  { name: 'Arquitectura de Computadores', code: 'SIS-302', area: 'Ingeniería', desc: 'Conjunto de instrucciones ALU, microcontroladores, jerarquía de memorias caché y buses.', icon: 'chip' },
  { name: 'Sistemas Operativos', code: 'SIS-401', area: 'Ingeniería', desc: 'Planificación de procesos (CPU), sincronización, memoria virtual, paginación y POSIX.', icon: 'console' },
  { name: 'Redes de Computadores', code: 'SIS-402', area: 'Ingeniería', desc: 'Pila de protocolos OSI y TCP/IP, direccionamiento IPv4/IPv6, subredes, switches y routers.', icon: 'lan' },
  { name: 'Ingeniería de Software', code: 'SIS-501', area: 'Ingeniería', desc: 'Ciclos de vida del software, Scrum ágil, diagramas UML, patrones GoF y pruebas automatizadas.', icon: 'application-brackets-outline' },
  { name: 'Seguridad Informática', code: 'SIS-502', area: 'Ingeniería', desc: 'Criptografía asimétrica, certificados TLS/SSL, cortafuegos, pentesting y OWASP Top 10.', icon: 'shield-lock-outline' },
  { name: 'Gestión de Proyectos de TI', code: 'SIS-601', area: 'Ingeniería', desc: 'Lineamientos PMI/PMBOK, estimación COCOMO, riesgos tecnológicos y presupuesto de TI.', icon: 'briefcase-check-outline' },
  { name: 'Desarrollo de Aplicaciones Móviles', code: 'SIS-602', area: 'Ingeniería', desc: 'React Native, Expo SDK 57, navegación nativa, arquitectura por componentes y consumo de APIs.', icon: 'cellphone' },
  { name: 'Inteligencia Artificial', code: 'SIS-701', area: 'Ingeniería', desc: 'Modelos de Machine Learning, visión artificial, procesamiento de lenguaje natural (PLN) y agentes.', icon: 'brain' },

  // 3. Ciencias Económicas, Administrativas y Contables
  { name: 'Administración General', code: 'ADM-101', area: 'Administración', desc: 'Planificación estratégica, estructura organizacional, liderazgo gerencial y control operacional.', icon: 'domain' },
  { name: 'Contabilidad Financiera', code: 'CON-101', area: 'Administración', desc: 'Principio de partida doble, catálogo de cuentas, libro mayor y elaboración del balance general.', icon: 'ledger' },
  { name: 'Costos y Presupuestos', code: 'CON-201', area: 'Administración', desc: 'Costeo por órdenes y procesos, costeo variable, punto de equilibrio y presupuesto maestro.', icon: 'cash-register' },
  { name: 'Macroeconomía', code: 'ECO-201', area: 'Economía', desc: 'Producto Interno Bruto (PIB), política monetaria del Banco de la República, inflación y balanza comercial.', icon: 'finance' },
  { name: 'Microeconomía', code: 'ECO-101', area: 'Economía', desc: 'Curvas de indiferencia, elasticidad de la demanda, estructuras de monopolio y oligopolio.', icon: 'chart-areaspline' },
  { name: 'Finanzas Corporativas', code: 'FIN-301', area: 'Finanzas', desc: 'Cálculo del costo promedio de capital WACC, evaluación de flujos descontados y estructura financiera.', icon: 'bank' },
  { name: 'Mercadeo Estratégico', code: 'MER-201', area: 'Administración', desc: 'Segmentación de mercados, matriz DOFA, posicionamiento de marca y embudos de conversión.', icon: 'bullhorn' },
  { name: 'Gestión del Talento Humano', code: 'ADM-301', area: 'Administración', desc: 'Atracción del talento, evaluación de desempeño por competencias 360° y bienestar laboral.', icon: 'account-group' },
  { name: 'Derecho Comercial y Laboral', code: 'DER-202', area: 'Ciencias Sociales', desc: 'Sociedades mercantiles, contratos individuales de trabajo, prestaciones sociales y régimen sindical.', icon: 'book-open-page-variant' },
  { name: 'Formulación y Evaluación de Proyectos', code: 'ADM-401', area: 'Administración', desc: 'Estudios de mercado técnico-económicos, Tasa Interna de Retorno (TIR) y Valor Presente Neto (VPN).', icon: 'file-check-outline' },
  { name: 'Comercio Internacional', code: 'NEG-201', area: 'Negocios', desc: 'Incoterms actualizados, aranceles aduaneros DIAN, acuerdos de libre comercio y transporte marítimo.', icon: 'ferry' },
  { name: 'Logística y Cadena de Suministro', code: 'ADM-402', area: 'Administración', desc: 'Gestión de inventarios just-in-time, centros de distribución (CEDI) y optimización de rutas.', icon: 'truck-fast' },

  // 4. Ciencias Sociales, Humanidades e Identidad Regional Uniguajira
  { name: 'Sociología General', code: 'SOC-101', area: 'Humanidades', desc: 'Teoría sociológica clásica y contemporánea, estratificación y dinámicas de interacción social.', icon: 'account-multiple' },
  { name: 'Antropología Cultural', code: 'ANT-101', area: 'Humanidades', desc: 'Etnografía reflexiva, simbolismo, mitos y cosmovisiones de comunidades indígenas y afrodescendientes.', icon: 'earth' },
  { name: 'Etnoeducación e Interculturalidad', code: 'ETN-101', area: 'Identidad Uniguajira', desc: 'Epistemologías del sur, descolonización del saber, diálogo de saberes y educación propia en La Guajira.', icon: 'account-heart' },
  { name: 'Lengua y Cultura Wayuunaiki', code: 'WAY-101', area: 'Identidad Uniguajira', desc: 'Fonética wayuu, vocabulario cotidiano, ley consuetudinaria (Pütchipü’üi) y estructura de clanes (eirruku).', icon: 'comment-text-multiple' },
  { name: 'Metodología de la Investigación', code: 'INV-101', area: 'Investigación', desc: 'Formulación del problema de investigación, marco teórico, diseño metodológico y citación APA 7ma.', icon: 'text-box-search-outline' },
  { name: 'Epistemología', code: 'HUM-101', area: 'Humanidades', desc: 'Naturaleza del conocimiento científico, falsacionismo de Popper, paradigmas de Kuhn y fenomenología.', icon: 'lightbulb-outline' },
  { name: 'Pedagogía y Didáctica General', code: 'EDU-101', area: 'Educación', desc: 'Constructivismo de Piaget y Vygotsky, aprendizaje significativo de Ausubel y diseño de secuencias.', icon: 'human-male-board' },
  { name: 'Psicología Evolutiva', code: 'PSI-201', area: 'Ciencias Sociales', desc: 'Desarrollo humano desde la infancia hasta la adultez tardía según Erikson, Piaget y Kohlberg.', icon: 'head-heart-outline' },
  { name: 'Evaluación Educativa', code: 'EDU-201', area: 'Educación', desc: 'Evaluación formativa, diagnóstica y sumativa, diseño de rúbricas analíticas y retroalimentación efectiva.', icon: 'clipboard-check-outline' },
  { name: 'Ética y Responsabilidad Social', code: 'HUM-102', area: 'Humanidades', desc: 'Deontología profesional, dilemas éticos contemporáneos, bioética y ciudadanía activa responsable.', icon: 'shield-account-outline' },
  { name: 'Constitución Política y Democracia', code: 'DER-101', area: 'Ciencias Sociales', desc: 'Estructura del Estado colombiano, acción de tutela, derechos fundamentales y mecanismos de participación.', icon: 'scale-balance' },
  { name: 'Historia y Contexto Regional de La Guajira', code: 'HIS-101', area: 'Identidad Uniguajira', desc: 'Historia territorial, poblamiento guajiro, bonanzas económicas del siglo XX y geopolítica peninsular.', icon: 'history' },
];

/**
 * Retorna todos los pregrados aplanados con nombre y color de facultad
 */
export function getAllUndergraduatePrograms() {
  const all = [];
  uniguajiraFaculties.forEach((fac) => {
    fac.programs.forEach((prog) => {
      all.push({
        ...prog,
        facultyId: fac.id,
        facultyName: fac.name,
        facultyColor: fac.color,
      });
    });
  });
  return all;
}

/**
 * Búsqueda inteligente de asignaturas por nombre, código o área
 */
export function searchCurriculumSubjects(query = '') {
  if (!query.trim()) return uniguajiraCurriculumSubjects;
  const q = query.toLowerCase();
  return uniguajiraCurriculumSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q)
  );
}

/**
 * Retorna diplomados agrupados por área temática
 */
export function getDiplomasByArea(area = '') {
  if (!area) return uniguajiraDiplomas;
  return uniguajiraDiplomas.filter((d) => d.area === area);
}
