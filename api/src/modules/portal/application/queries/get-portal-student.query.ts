import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { NotFoundException }           from '@nestjs/common'
import { PortalRepository }            from '../../domain/portal.repository'
import type { PortalStudentResponse }  from '@control-aula/shared'

export class GetPortalStudentQuery {
  constructor(public readonly studentId: string) {}
}

@QueryHandler(GetPortalStudentQuery)
export class GetPortalStudentHandler implements IQueryHandler<GetPortalStudentQuery, PortalStudentResponse> {
  constructor(private readonly repo: PortalRepository) {}

  async execute({ studentId }: GetPortalStudentQuery): Promise<PortalStudentResponse> {
    const data = await this.repo.getStudentData(studentId)
    if (!data) throw new NotFoundException('Estudiante no encontrado')
    return data
  }
}
