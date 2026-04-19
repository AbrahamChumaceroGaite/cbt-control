import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService }                             from '@nestjs/config'
import type { InternalStudentResponse }              from '@control-aula/shared'

@Injectable()
export class StudentClient {
  private readonly baseUrl: string
  private readonly secret:  string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('CORE_API_URL') ?? 'http://localhost:4001'
    this.secret  = this.config.get<string>('INTERNAL_SECRET') ?? ''
  }

  async getStudent(studentId: string): Promise<InternalStudentResponse> {
    const res = await fetch(`${this.baseUrl}/internal/student/${studentId}`, {
      headers: { 'x-internal-secret': this.secret },
    })
    if (!res.ok) {
      throw new InternalServerErrorException(`Core API getStudent returned ${res.status}`)
    }
    const body = await res.json() as { data: InternalStudentResponse }
    return body.data
  }
}
