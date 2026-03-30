// Individual actions — se aplican a un estudiante (y suman también al curso)
// Class actions    — se aplican al curso completo (affectsStudent: false)

export const ACTIONS = [
  // ── Individual: Workbook ──────────────────────────────────────────
  { id: 'act-wb-focus',      name: 'Workbook - Focus',            coins:  2, category: 'amber',  affectsClass: true,  affectsStudent: true  },
  { id: 'act-wb-practice',   name: 'Workbook - Practice',         coins:  2, category: 'amber',  affectsClass: true,  affectsStudent: true  },
  { id: 'act-wb-challenge',  name: 'Workbook - Challenge',        coins:  2, category: 'amber',  affectsClass: true,  affectsStudent: true  },

  // ── Individual: Boss Challenge ────────────────────────────────────
  { id: 'act-boss-notebook', name: 'Boss Challenge - Notebook',   coins:  3, category: 'purple', affectsClass: true,  affectsStudent: true  },
  { id: 'act-boss-board',    name: 'Boss Challenge - Board',      coins:  4, category: 'purple', affectsClass: true,  affectsStudent: true  },

  // ── Individual: Extra Challenge ───────────────────────────────────
  { id: 'act-extra-2',       name: 'Extra Challenge',             coins:  2, category: 'mag',    affectsClass: true,  affectsStudent: true  },
  { id: 'act-extra-3',       name: 'Extra Challenge',             coins:  3, category: 'mag',    affectsClass: true,  affectsStudent: true  },

  // ── Individual: Negative ──────────────────────────────────────────
  { id: 'act-esquela',       name: 'Esquela Strike',              coins: -5, category: 'red',    affectsClass: false, affectsStudent: true  },
  { id: 'act-exiliado',      name: 'Exiliado',                    coins: -4, category: 'red',    affectsClass: false, affectsStudent: true  },

  // ── Class: Positive ───────────────────────────────────────────────
  { id: 'act-participacion', name: 'Participación Activa',        coins:  5, category: 'green',  affectsClass: true,  affectsStudent: false },
  { id: 'act-silencio',      name: 'Trabajo en Silencio',         coins:  7, category: 'blue',   affectsClass: true,  affectsStudent: false },
  { id: 'act-limpio',        name: 'Curso Limpio',                coins:  6, category: 'green',  affectsClass: true,  affectsStudent: false },
  { id: 'act-codo',          name: 'Equipo Codo a Codo',          coins:  8, category: 'blue',   affectsClass: true,  affectsStudent: false },

  // ── Class: Negative ───────────────────────────────────────────────
  { id: 'act-disruptivo',    name: 'Comportamiento Disruptivo',   coins: -3, category: 'red',    affectsClass: true,  affectsStudent: false },
  { id: 'act-desorden',      name: 'Desorden Inminente',          coins: -4, category: 'red',    affectsClass: true,  affectsStudent: false },
]
