import { NextResponse } from 'next/server'
import { StudentService } from '@/server/services/StudentService'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const students = await StudentService.getStudentsByCourse(courseId)
    return NextResponse.json(students)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const student = await StudentService.createStudent(data)
    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
