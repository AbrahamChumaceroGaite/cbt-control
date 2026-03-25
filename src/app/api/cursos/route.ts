import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { CourseService } from '@/server/services/CourseService'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const courses = await CourseService.getAllCourses()
    return NextResponse.json(courses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    const course = await CourseService.createCourse(data)
    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
