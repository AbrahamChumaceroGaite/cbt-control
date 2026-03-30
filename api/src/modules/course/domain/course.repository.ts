import type { CourseEntity } from './course.entity'

export abstract class CourseRepository {
  abstract findAll(): Promise<CourseEntity[]>
  abstract findById(id: string): Promise<CourseEntity | null>
  abstract create(data: { name: string; level: string; parallel: string }): Promise<CourseEntity>
  abstract update(id: string, data: { name?: string; level?: string; parallel?: string }): Promise<CourseEntity>
  abstract delete(id: string): Promise<void>
}
