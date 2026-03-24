const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const s2a = await prisma.course.findFirst({ where: { name: 'S2A' } })
  const s1a = await prisma.course.findFirst({ where: { name: 'S1A' } })
  
  if (s2a && s1a) {
    const res = await prisma.student.updateMany({
      where: { courseId: s2a.id },
      data: { courseId: s1a.id }
    })
    console.log(`Successfully moved ${res.count} students from S2A to S1A`)
  } else {
    console.log("Error: One or both courses not found")
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
