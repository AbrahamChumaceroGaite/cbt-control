import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
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

/**
 * Seeds students and returns a map of studentId → generated code (e.g. "s1a01").
 */
async function seedStudents(courseId: string): Promise<{ id: string; code: string }[]> {
  const students = STUDENTS_BY_COURSE[courseId]
  if (!students?.length) return []
  console.log(`  Seeding ${students.length} students for ${courseId}...`)

  // Short prefix: "course-s1a" → "s1a"
  const prefix = courseId.replace('course-', '')
  const result: { id: string; code: string }[] = []

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const id = `${prefix}-${s.name.replace(/\s/g, '-').toLowerCase()}`
    const code = `${prefix}${String(i + 1).padStart(2, '0')}` // e.g. "s1a01"

    await prisma.student.upsert({
      where: { id },
      update: {},  // never overwrite existing coins from app activity
      create: { id, courseId, name: s.name, coins: s.coins, code },
    })

    result.push({ id, code })
  }

  return result
}

async function seedActions() {
  console.log('Seeding Actions...')
  for (const a of ACTIONS) {
    await prisma.action.upsert({ where: { id: a.id }, update: a, create: a })
  }
}

async function seedRewards() {
  console.log('Seeding Rewards...')
  for (const r of [...CLASS_REWARDS, ...INDIVIDUAL_REWARDS]) {
    await prisma.reward.upsert({ where: { id: r.id }, update: r, create: r })
  }
}

async function seedUsers(allStudents: { id: string; code: string }[]) {
  console.log('Seeding Users...')

  // Default admin account
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      code: 'admin',
      passwordHash: adminHash,
      role: 'admin',
      fullName: 'Administrador',
    },
  })
  console.log('  Admin user: code=admin, password=admin123')

  // One User per student — password defaults to their code (e.g. "s1a01")
  for (const { id, code } of allStudents) {
    const existing = await prisma.user.findFirst({ where: { studentId: id } })
    if (existing) continue  // don't overwrite custom passwords

    // Check if code is already taken (edge case: re-seeding with different student mapping)
    const codeExists = await prisma.user.findUnique({ where: { code } })
    if (codeExists) continue

    const hash = await bcrypt.hash(code, 12)
    await prisma.user.create({
      data: {
        code,
        passwordHash: hash,
        role: 'student',
        studentId: id,
      },
    })
  }

  console.log(`  Created user accounts for ${allStudents.length} students`)
}

async function main() {
  try {
    const courses = await seedCourses()
    const allStudents: { id: string; code: string }[] = []
    for (const course of courses) {
      const students = await seedStudents(course.id)
      allStudents.push(...students)
    }
    await seedActions()
    await seedRewards()
    await seedUsers(allStudents)
    console.log('✅ Seed completed successfully')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
