import { NextResponse } from 'next/server'
import { StudentService } from '@/server/services/StudentService'

export async function POST(req: Request) {
  try {
    const { courseId, students } = await req.json()
    if (!courseId || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Faltan datos o lista vacía' }, { status: 400 })
    }

    const result = await StudentService.createManyStudents(courseId, students)

    return NextResponse.json({ ok: true, count: result.count }, { status: 201 })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
