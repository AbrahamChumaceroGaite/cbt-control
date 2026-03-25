import { NextResponse } from 'next/server'
import { StudentService } from '@/server/services/StudentService'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const student = await StudentService.getStudentById(params.id)
    if (!student) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(student)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const student = await StudentService.updateStudent(params.id, data)
    return NextResponse.json(student)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await StudentService.deleteStudent(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
