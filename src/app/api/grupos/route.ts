import { NextResponse } from 'next/server'
import { GroupService } from '@/server/services/GroupService'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const groups = await GroupService.getGroupsByCourse(courseId)
    return NextResponse.json(groups)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const group = await GroupService.createGroup({
      name: data.name,
      courseId: data.courseId,
      studentIds: data.memberIds || data.studentIds
    })
    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
