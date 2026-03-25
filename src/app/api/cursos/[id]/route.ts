import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { CourseService } from '@/server/services/CourseService'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const course = await CourseService.getCourseById(params.id)
    if (!course) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    const course = await CourseService.updateCourse(params.id, data)
    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    await CourseService.deleteCourse(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
