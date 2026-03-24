import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Courses
  const s2a = await prisma.course.upsert({
    where: { id: 'course-s2a' },
    update: {},
    create: {
      id: 'course-s2a', name: 'S2A', level: 'Secondary 2', parallel: 'A', plant: 'Lechuga',
    },
  })
  const s2b = await prisma.course.upsert({
    where: { id: 'course-s2b' },
    update: {},
    create: { id: 'course-s2b', name: 'S2B', level: 'Secondary 2', parallel: 'B', plant: 'Tomate' },
  })
  const s2c = await prisma.course.upsert({
    where: { id: 'course-s2c' },
    update: {},
    create: { id: 'course-s2c', name: 'S2C', level: 'Secondary 2', parallel: 'C', plant: 'Tomate Cherry' },
  })

  // Students S2A
  const s2aStudents = [
    'Orihuela Camilo', 'Bled Rivero Julieta', 'Casso Arce Mikaela Belen',
    'Cespedes Gonzales Andre', 'Cortez Velasco Camila Victoria', 'Hurtado Aracena Carlos Augusto',
    'Jaramillo Sardina Romelia', 'Leyton Cornejo Adriana Natalia', 'Medina Albino Mario Daniel',
    'Navarro Canedo André', 'Ramirez Pradel Hadasa', 'Rios Zambrana Eric Rodolfo',
    'Rivera Ocampo Isabella', 'Ruiz Castillo Elisa', 'Sanjines Trigo Ignacio',
    'Tarraga Flores Leandro', 'Vaca Garcia Victoria Elisa', 'Vallejo Exeni Pablo Alejandro',
    'Velasquez Lopez Hugo Fernando',
  ]
  for (const name of s2aStudents) {
    await prisma.student.upsert({
      where: { id: `s2a-${name.replace(/\s/g,'-').toLowerCase()}` },
      update: {},
      create: { id: `s2a-${name.replace(/\s/g,'-').toLowerCase()}`, courseId: s2a.id, name },
    })
  }

  // Default actions
  const actions = [
    { id: 'act-participacion', name: 'Participación activa', points: 2, category: 'green' },
    { id: 'act-equipo', name: 'Trabajo en equipo', points: 3, category: 'blue' },
    { id: 'act-silencio', name: 'Silencio sostenido', points: 1, category: 'blue', affectsStudent: false },
    { id: 'act-planta', name: 'Logro en planta', points: 4, category: 'green' },
    { id: 'act-tarea', name: 'Tarea entregada', points: 2, category: 'amber' },
    { id: 'act-t1', name: 'Tramo T1 — Atención demostrada', points: 3, category: 'purple' },
    { id: 'act-t2', name: 'Tramo T2 — Indagación demostrada', points: 3, category: 'purple' },
    { id: 'act-t3', name: 'Tramo T3 — Metacognición demostrada', points: 3, category: 'purple' },
    { id: 'act-t4', name: 'Tramo T4 — Pens. Analítico demostrado', points: 4, category: 'purple' },
    { id: 'act-t5', name: 'Tramo T5 — Apz. Autónomo demostrado', points: 4, category: 'purple' },
    { id: 'act-t6', name: 'Tramo T6 — Colaboración demostrada', points: 4, category: 'purple' },
    { id: 'act-t7', name: 'Tramo T7 — Innovación demostrada', points: 5, category: 'purple' },
    { id: 'act-disruptivo', name: 'Comportamiento disruptivo', points: -3, category: 'red' },
  ]
  for (const a of actions) {
    await prisma.action.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, affectsClass: true, affectsStudent: a.affectsStudent ?? true },
    })
  }

  // Default rewards
  const rewards = [
    { id: 'rew-musica', name: 'Música de fondo 5 min', icon: '♪', pointsRequired: 30, type: 'class' },
    { id: 'rew-asiento', name: 'Elegir asiento libre', icon: '⇄', pointsRequired: 60, type: 'class', description: '1 clase' },
    { id: 'rew-video', name: 'Clip de video 10 min', icon: '▶', pointsRequired: 100, type: 'class', description: 'A elección del grupo' },
    { id: 'rew-musica-libre', name: 'Clase con música libre', icon: '♫', pointsRequired: 150, type: 'class', description: 'Durante trabajo grupal' },
    { id: 'rew-pelicula', name: 'Ver película 30 min', icon: '◉', pointsRequired: 200, type: 'class', description: 'A elección de la clase' },
    { id: 'rew-pausa', name: 'Pausa extra 10 min', icon: '★', pointsRequired: 300, type: 'class', description: 'Sorpresa final de parcial' },
    { id: 'rew-ind-asiento', name: 'Elegir con quién sentarse', icon: '→', pointsRequired: 20, type: 'individual' },
    { id: 'rew-ind-bonus', name: '+3 pts en una actividad', icon: '+', pointsRequired: 40, type: 'individual' },
    { id: 'rew-ind-cierre', name: 'Elegir actividad de cierre', icon: '◆', pointsRequired: 80, type: 'individual' },
  ]
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, description: r.description ?? '' },
    })
  }

  console.log('Seed completed')
}

main().catch(console.error).finally(() => prisma.$disconnect())
