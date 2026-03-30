import type { StudentEntity } from './student.entity'

export abstract class StudentRepository {
  abstract findAll(courseId?: string): Promise<StudentEntity[]>
  abstract findById(id: string): Promise<StudentEntity | null>
  abstract create(data: { courseId: string; name: string; code?: string; email?: string }): Promise<StudentEntity>
  abstract createMany(courseId: string, students: { name: string; code?: string; email?: string }[]): Promise<number>
  abstract update(id: string, data: { name?: string; code?: string; email?: string; coins?: number; tramos?: string[] }): Promise<StudentEntity>
  abstract delete(id: string): Promise<void>
}
