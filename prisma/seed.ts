import { PrismaClient } from '@prisma/client'
import { COURSES } from '../src/data/courses'
import { STUDENTS_BY_COURSE } from '../src/data/students'
import { ACTIONS } from '../src/data/actions'
import { CLASS_REWARDS, INDIVIDUAL_REWARDS } from '../src/data/rewards'

const prisma = new PrismaClient()

async function seedCourses() {
  console.log('Seeding Courses...')
  const created = []
  for (const c of COURSES) {
    const course = await prisma.course.upsert({ where: { id: c.id }, update: {}, create: c })
    created.push(course)
  }
  return created
}

async function seedStudents(courseId: string, students: string[]) {
  console.log(`Seeding Students for ${courseId}...`)
  for (const name of students) {
    const id = `${courseId.replace('course-', '')}-${name.replace(/\s/g, '-').toLowerCase()}`
    await prisma.student.upsert({ where: { id }, update: {}, create: { id, courseId, name } })
  }
}

async function seedActions() {
  console.log('Seeding Actions...')
  for (const a of ACTIONS) {
    await prisma.action.upsert({ where: { id: a.id }, update: {}, create: a })
  }
}

async function seedRewards() {
  console.log('Seeding Rewards...')
  for (const r of [...CLASS_REWARDS, ...INDIVIDUAL_REWARDS]) {
    await prisma.reward.upsert({ where: { id: r.id }, update: {}, create: r })
  }
}

async function main() {
  try {
    const courses = await seedCourses()
    for (const course of courses) {
      const students = STUDENTS_BY_COURSE[course.id]
      if (students) await seedStudents(course.id, students)
    }
    await seedActions()
    await seedRewards()
    console.log('✅ Seed completed successfully')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
