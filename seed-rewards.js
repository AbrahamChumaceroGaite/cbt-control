const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.reward.deleteMany()

  // GROUP REWARDS
  const globalRewards = [
    { name: '10Min de descanso', icon: '⏱️', pointsRequired: 50, isGlobal: true, isActive: true },
    { name: 'Cambio de asientos (por clase)', icon: '🪑', pointsRequired: 100, isGlobal: true, isActive: true },
    { name: 'Cambio de asientos para la semana', icon: '🔁', pointsRequired: 150, isGlobal: true, isActive: true },
    { name: 'Música libre (elección grupal)', icon: '🎵', pointsRequired: 200, isGlobal: true, isActive: true },
    { name: '+3 puntos en actividad', icon: '⭐', pointsRequired: 300, isGlobal: true, isActive: true },
    { name: '20Min de película', icon: '🎬', pointsRequired: 400, isGlobal: true, isActive: true },
    { name: 'Juego recreativo', icon: '🎲', pointsRequired: 500, isGlobal: true, isActive: true },
  ]

  // INDIVIDUAL REWARDS
  const individualRewards = [
    { name: 'Descanso de 5min', icon: '🍵', pointsRequired: 10, isGlobal: false, isActive: true },
    { name: 'Cambio de asiento (1 clase)', icon: '🪑', pointsRequired: 20, isGlobal: false, isActive: true },
    { name: 'AntiCastigos', icon: '🛡️', pointsRequired: 30, isGlobal: false, isActive: true },
    { name: '+2 puntos (para sí o grupo)', icon: '✨', pointsRequired: 40, isGlobal: false, isActive: true },
    { name: 'Cancelar Canciones', icon: '🔇', pointsRequired: 50, isGlobal: false, isActive: true },
    { name: 'Selección de Música (para clase)', icon: '🎧', pointsRequired: 60, isGlobal: false, isActive: true },
    { name: 'Escoger video en clase (Max 8m)', icon: '📺', pointsRequired: 80, isGlobal: false, isActive: true },
    { name: 'Cambio de asiento (toda la semana)', icon: '🔁', pointsRequired: 100, isGlobal: false, isActive: true },
    { name: 'Uso de tablet por 15min', icon: '📱', pointsRequired: 150, isGlobal: false, isActive: true },
  ]

  const records = [...globalRewards, ...individualRewards]
  
  for (const reward of records) {
    await prisma.reward.create({
      data: {
        name: reward.name,
        description: '',
        icon: reward.icon,
        pointsRequired: reward.pointsRequired,
        isGlobal: reward.isGlobal,
        isActive: reward.isActive,
      }
    })
  }
  
  console.log(`Successfully created ${records.length} new battle pass rewards !`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
