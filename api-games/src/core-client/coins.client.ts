import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService }                             from '@nestjs/config'
import type {
  InternalCoinOpResponse,
  InternalGrantCoinsRequest,
  InternalSpendCoinsRequest,
} from '@control-aula/shared'

@Injectable()
export class CoinsClient {
  private readonly baseUrl: string
  private readonly secret:  string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('CORE_API_URL') ?? 'http://localhost:4001'
    this.secret  = this.config.get<string>('INTERNAL_SECRET') ?? ''
  }

  private headers(): Record<string, string> {
    return { 'Content-Type': 'application/json', 'x-internal-secret': this.secret }
  }

  async grant(req: InternalGrantCoinsRequest): Promise<InternalCoinOpResponse> {
    const res = await fetch(`${this.baseUrl}/internal/coins/grant`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify(req),
    })
    if (!res.ok) {
      throw new InternalServerErrorException(`Core API grant returned ${res.status}`)
    }
    const body = await res.json() as { data: InternalCoinOpResponse }
    return body.data
  }

  async spend(req: InternalSpendCoinsRequest): Promise<InternalCoinOpResponse> {
    const res = await fetch(`${this.baseUrl}/internal/coins/spend`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify(req),
    })
    if (!res.ok) {
      throw new InternalServerErrorException(`Core API spend returned ${res.status}`)
    }
    const body = await res.json() as { data: InternalCoinOpResponse }
    return body.data
  }
}
