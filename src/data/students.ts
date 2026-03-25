/**
 * Nóminas por course id, ordenadas por N° del CSV.
 * Para agregar coins iniciales (ej. MathCoins migrados), editar el campo `coins` de cada alumno.
 * S2 arranca en 0 coins. S1 también por ahora — completar con MathCoins cuando estén disponibles.
 */
export type StudentSeed = { name: string; coins: number }

export const STUDENTS_BY_COURSE: Record<string, StudentSeed[]> = {

  // ── Secondary 1 ────────────────────────────────────────────────────
  'course-s1a': [
    { name: 'Orihuela Camilo',                    coins: 0 },  // N°1
    { name: 'Bled Rivero Julieta',                coins: 0 },  // N°2
    { name: 'Casso Arce Mikaela Belen',           coins: 0 },  // N°3
    { name: 'Cespedes Gonzales Andre',            coins: 0 },  // N°4
    { name: 'Cortez Velasco Camila Victoria',     coins: 0 },  // N°5
    { name: 'Hurtado Aracena Carlos Augusto',     coins: 0 },  // N°6
    { name: 'Jaramillo Sardina Romelia de los Angeles', coins: 0 }, // N°7
    { name: 'Leyton Cornejo Adriana Natalia',     coins: 0 },  // N°8
    { name: 'Medina Albino Mario Daniel',         coins: 0 },  // N°9
    { name: 'Navarro Canedo André',               coins: 0 },  // N°10
    { name: 'Ramirez Pradel Hadasa',              coins: 0 },  // N°11
    { name: 'Rios Zambrana Eric Rodolfo',         coins: 0 },  // N°12
    { name: 'Rivera Ocampo Isabella',             coins: 0 },  // N°13
    { name: 'Ruiz Castillo Elisa',                coins: 0 },  // N°14
    { name: 'Sanjines Trigo Ignacio',             coins: 0 },  // N°15
    { name: 'Tarraga Flores Leandro Matias',      coins: 0 },  // N°16
    { name: 'Vaca Garcia Victoria Elisa',         coins: 0 },  // N°17
    { name: 'Vallejo Exeni Pablo Alejandro',      coins: 0 },  // N°18
    { name: 'Velasquez Lopez Hugo Fernando',      coins: 0 },  // N°19
  ],

  'course-s1b': [
    { name: 'Polo Cesar Dionicio',                coins: 0 },  // N°1
    { name: 'Angulo Mendoza Sofia Paola',         coins: 0 },  // N°2
    { name: 'Baldivieso Da Silva Maria Agustina', coins: 0 },  // N°3
    { name: 'Cossio Velasquez Bruno Josue',       coins: 0 },  // N°4
    { name: 'Ferrufino Soto Santino Johan',       coins: 0 },  // N°5
    { name: 'Flores Fernandez Thiago Matias',     coins: 0 },  // N°6
    { name: 'Flores Pavez Emilia Zoe',            coins: 0 },  // N°7
    { name: 'Francisco Aramayo Carmen Constanza', coins: 0 },  // N°8
    { name: 'Galarza Vaca Muriel',                coins: 0 },  // N°9
    { name: 'Guerra Chavez Liam Gabriel',         coins: 0 },  // N°10
    { name: 'Gutierrez Castañon Leonardo Shiomar',coins: 0 },  // N°11
    { name: 'Martínez Colquechambi Violeta',      coins: 0 },  // N°12
    { name: 'Miranda Jijena Matias Hector',       coins: 0 },  // N°13
    { name: 'Mogro Siles Juan Manuel',            coins: 0 },  // N°14
    { name: 'Ortiz Peffaure Catalina',            coins: 0 },  // N°15
    { name: 'Pecile Soruco Maria',                coins: 0 },  // N°16
    { name: 'Pizarro Morales Luis Augusto',       coins: 0 },  // N°17
    { name: 'Ramirez Sola Evangelina Claudia',    coins: 0 },  // N°18
    { name: 'Valdez Tolaba José Fernando',        coins: 0 },  // N°19
  ],

  'course-s1c': [
    { name: 'Beccar Julio Ana Teresa',            coins: 0 },  // N°1
    { name: 'Copa Zuruguay Mariana',              coins: 0 },  // N°2
    { name: 'Cuellar Tejerina Sergio Emiliano',   coins: 0 },  // N°3
    { name: 'Escalante Romero Santiago Nicolas',  coins: 0 },  // N°4
    { name: 'Fernandez Miranda Victoria Elizabeth', coins: 0 }, // N°5
    { name: 'Figueroa Rengel Alicia',             coins: 0 },  // N°6
    { name: 'Flores Aparicio Abisai Daniela',     coins: 0 },  // N°7
    { name: 'Ibañez Montellano Facundo',          coins: 0 },  // N°8
    { name: 'Irahola Santos Dannye Mathias',      coins: 0 },  // N°9
    { name: 'Iturri Cortez Josefina',             coins: 0 },  // N°10
    { name: 'Leyton Aramayo Agustin Hector',      coins: 0 },  // N°11
    { name: 'Luna Orozco Vedia Diego Octavio',    coins: 0 },  // N°12
    { name: 'Ordoñez Arce Selva Patricia',        coins: 0 },  // N°13
    { name: 'Padilla Ordoñez Carlos Adrian',      coins: 0 },  // N°14
    { name: 'Pereira Kohlberg Melissa',           coins: 0 },  // N°15
    { name: 'Sanchez Soliz Victor Santiago',      coins: 0 },  // N°16
    { name: 'Santos Torrez Luna Celeste',         coins: 0 },  // N°17
    { name: 'Sotillo Serrano Valentina Ariana',   coins: 0 },  // N°18
    { name: 'Zilveti Coca Martha Elena',          coins: 0 },  // N°19
  ],

  // ── Secondary 2 (0 coins iniciales) ───────────────────────────────
  'course-s2a': [
    { name: 'Alarcon Molina Santiago Nicolas',    coins: 0 },  // N°1
    { name: 'Alarcon Rojas Briana Fernanda',      coins: 0 },  // N°2
    { name: 'Alcoreza Trigo Josefa Irene',        coins: 0 },  // N°3
    { name: 'Antequera Collarani Santiago Nahuel',coins: 0 },  // N°4
    { name: 'Antuña Videz Gemma Mariana',         coins: 0 },  // N°5
    { name: 'Berciano Cuenca Mael Imanol',        coins: 0 },  // N°6
    { name: 'Canedo Kohlberg Pablo Adriano',      coins: 0 },  // N°7
    { name: 'Cari Villa Ariana Lujan',            coins: 0 },  // N°8
    { name: 'Catari Velasquez Briana Aracely',    coins: 0 },  // N°9
    { name: 'Conzelmann Montero Jose Gustavo',    coins: 0 },  // N°10
    { name: 'Costas Villarroel Grace Isabel',     coins: 0 },  // N°11
    { name: 'Eamara Figueroa Rosa Belen',         coins: 0 },  // N°12
    { name: 'Escalante Castillo Percy',           coins: 0 },  // N°13
    { name: 'Gareca Arroyo Seleste de los Angeles', coins: 0 }, // N°14
    { name: 'Jimenez Polo Sol Luciana',           coins: 0 },  // N°15
    { name: 'Kohlberg Arce Irene',                coins: 0 },  // N°16
    { name: 'Murillo Mendez Maximiliano Andre',   coins: 0 },  // N°17
    { name: 'Rios Zambrana Luz Maria',            coins: 0 },  // N°18
    { name: 'Roda Lea Plaza Joaquin Alejandro',   coins: 0 },  // N°19
    { name: 'Salazar Iriarte Sergio',             coins: 0 },  // N°20
    { name: 'Thompson Navarro Zoe',               coins: 0 },  // N°21
    { name: 'Villarpando Fuentes Leandro Ramiro', coins: 0 },  // N°22
    { name: 'Villarroel Perez Facundo',           coins: 0 },  // N°23
  ],

  'course-s2b': [
    { name: 'Quintero Mendoza Sandra Rosalia',    coins: 0 },  // N°1
    { name: 'Aleman Arzabe Mariano',              coins: 0 },  // N°2
    { name: 'Antelo Luciana Cecil',               coins: 0 },  // N°3
    { name: 'Armella Vacaflor Roberto',           coins: 0 },  // N°4
    { name: 'Bernabe Escalante Antonella Ratziel',coins: 0 },  // N°5
    { name: 'Crespo Jurado Sebastián Alexander',  coins: 0 },  // N°6
    { name: 'Cruz Reyes Bon Giovanni Matheo',     coins: 0 },  // N°7
    { name: 'Cuellar Gomez Martina',              coins: 0 },  // N°8
    { name: 'Diaz Romay Aaron Gabriel',           coins: 0 },  // N°9
    { name: 'Gamarra Gareca Victoria',            coins: 0 },  // N°10
    { name: 'Guerrero Castro Lucas Uriel',        coins: 0 },  // N°11
    { name: 'Krayasich Chavarria Santiago Adel',  coins: 0 },  // N°12
    { name: 'Mendez Ruiz Luciana Claudia',        coins: 0 },  // N°13
    { name: 'Montero Vargas Julieta Fernanda',    coins: 0 },  // N°14
    { name: 'Paz Del Carpio Tamara',              coins: 0 },  // N°15
    { name: 'Quispe Zenteno Dafne Luana',         coins: 0 },  // N°16
    { name: 'Raya Melean Isabella Mariana',       coins: 0 },  // N°17
    { name: 'Strothmann Velasquez Wendelin',      coins: 0 },  // N°18
    { name: 'Teran Cardenas Paulina',             coins: 0 },  // N°19
    { name: 'Torrez Hoyos Thiago Emmanuel',       coins: 0 },  // N°20
    { name: 'Varca Villarrubia Thiago',           coins: 0 },  // N°21
    { name: 'Vasquez Luna Pizarro Mariano',       coins: 0 },  // N°22
    { name: 'Velasco Vega Victoria',              coins: 0 },  // N°23
  ],

  'course-s2c': [
    { name: 'Molina Anahi Jasiel',                coins: 0 },  // N°1
    { name: 'Alcoreza Romero Irina Sofia',        coins: 0 },  // N°2
    { name: 'Barriga Trabuco Eduardo',            coins: 0 },  // N°3
    { name: 'Bascon Sologuren Diego Alejandro',   coins: 0 },  // N°4
    { name: 'Cardona Leigue Victoria',            coins: 0 },  // N°5
    { name: 'Cortez Gallardo Alejandro Miguel',   coins: 0 },  // N°6
    { name: 'Cuellar Gomez Micaela',              coins: 0 },  // N°7
    { name: 'Echenique Gutierrez Jesus Alejandro',coins: 0 },  // N°8
    { name: 'Escalier Bernal Camila Isabel',      coins: 0 },  // N°9
    { name: 'Espinoza Franco Amaia Marilin',      coins: 0 },  // N°10
    { name: 'Fernandez Julio Ariana',             coins: 0 },  // N°11
    { name: 'Guardia Portillo Isabela',           coins: 0 },  // N°12
    { name: 'Lacaze Garnica Mikael',              coins: 0 },  // N°13
    { name: 'Lema Videz Lucio Leandro',           coins: 0 },  // N°14
    { name: 'Marcos Zarate Milan',                coins: 0 },  // N°15
    { name: 'Negron Peñaranda Isabella',          coins: 0 },  // N°16
    { name: 'Olivera Bolivar Thiago Joaquín',     coins: 0 },  // N°17
    { name: 'Osorio Rojas Carmen Yhuleni',        coins: 0 },  // N°18
    { name: 'Rivera Soria Dayra Luz Skarlet',     coins: 0 },  // N°19
    { name: 'Sanjines Trigo Ana Joaquina',        coins: 0 },  // N°20
    { name: 'Surriable Rioja Agustina',           coins: 0 },  // N°21
    { name: 'Trigo Baldiviezo Larissa Nicole',    coins: 0 },  // N°22
    { name: 'Vaca Uzqueda Nicolas',               coins: 0 },  // N°23
    { name: 'Velasquez Osorio Celeste Nathalia',  coins: 0 },  // N°24
  ],
}
