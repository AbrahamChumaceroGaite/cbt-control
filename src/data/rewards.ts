export const CLASS_REWARDS = [
  { id: 'rew-descanso10',     name: '10 min de descanso',              icon: '⏸️',  coinsRequired:  20, type: 'class', isGlobal: true, isActive: true, description: 'Toda la clase descansa 10 minutos.' },
  { id: 'rew-asiento-clase',  name: 'Cambio de asientos (1 clase)',    icon: '🔀',  coinsRequired:  40, type: 'class', isGlobal: true, isActive: true, description: 'La clase elige sus asientos por una sesión.' },
  { id: 'rew-asiento-semana', name: 'Cambio de asientos (semana)',     icon: '🗓️', coinsRequired:  70, type: 'class', isGlobal: true, isActive: true, description: 'La clase elige sus asientos por toda la semana.' },
  { id: 'rew-musica-libre',   name: 'Música libre (elección grupal)', icon: '🎵',  coinsRequired: 100, type: 'class', isGlobal: true, isActive: true, description: 'Los estudiantes eligen la música.' },
  { id: 'rew-pelicula20',     name: '20 min de película',              icon: '🎬',  coinsRequired: 150, type: 'class', isGlobal: true, isActive: true, description: 'La clase elige la película.' },
  { id: 'rew-bonus-actividad',name: '+3 coins en actividad',           icon: '⚡',  coinsRequired: 200, type: 'class', isGlobal: true, isActive: true, description: '+3 coins para todos en la siguiente actividad.' },
  { id: 'rew-juego',          name: 'Juego recreativo',                icon: '🎮',  coinsRequired: 300, type: 'class', isGlobal: true, isActive: true, description: 'Actividad lúdica de cierre de clase.' },
]

export const INDIVIDUAL_REWARDS = [
  { id: 'rew-ind-asiento-cl',  name: 'Cambio de asiento a elección (1 clase)', icon: '💺',  coinsRequired: 10, type: 'individual', isGlobal: false, isActive: true, description: 'Siéntate con quien quieras por una clase.' },
  { id: 'rew-ind-cancelar',    name: 'Cancelar Canciones',                     icon: '🚫',  coinsRequired: 10, type: 'individual', isGlobal: false, isActive: true, description: 'Puedes vetar una canción de la lista.' },
  { id: 'rew-ind-musica',      name: 'Selección de música para la clase',      icon: '🎤',  coinsRequired: 15, type: 'individual', isGlobal: false, isActive: true, description: 'Tú pones la música para todos.' },
  { id: 'rew-ind-asiento-sem', name: 'Cambio de asiento a elección (semana)',  icon: '📆',  coinsRequired: 20, type: 'individual', isGlobal: false, isActive: true, description: 'Siéntate con quien quieras por una semana.' },
  { id: 'rew-ind-descanso5',   name: 'Descanso personal 5 min',               icon: '😮‍💨', coinsRequired: 20, type: 'individual', isGlobal: false, isActive: true, description: 'Sales a tomar aire por 5 minutos.' },
  { id: 'rew-ind-video',       name: 'Escoge video (máx. 8 min)',              icon: '▶️',  coinsRequired: 25, type: 'individual', isGlobal: false, isActive: true, description: 'Elige un video corto para ver en clase.' },
  { id: 'rew-ind-bonus2',      name: '+2 coins para ti o tu grupo',            icon: '➕',  coinsRequired: 30, type: 'individual', isGlobal: false, isActive: true, description: 'Bonus de 2 coins extra aplicables a ti o tu grupo.' },
  { id: 'rew-ind-anticastigo', name: 'AntiCastigo',                            icon: '🛡️', coinsRequired: 40, type: 'individual', isGlobal: false, isActive: true, description: 'Cancela una amonestación o coin negativo.' },
  { id: 'rew-ind-tablet',      name: 'Uso de tablet 15 min',                   icon: '📱',  coinsRequired: 80, type: 'individual', isGlobal: false, isActive: true, description: 'Acceso libre a tablet por 15 minutos.' },
]
