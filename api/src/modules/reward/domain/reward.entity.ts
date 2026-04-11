export class RewardEntity {
  readonly id:             string
  readonly name:           string
  readonly description:    string
  readonly icon:           string
  readonly coinsRequired:  number
  readonly discount:       number
  readonly discountEndsAt: Date | null
  readonly type:           string
  readonly isGlobal:       boolean
  readonly isActive:       boolean
  readonly createdAt:      Date
  readonly updatedAt:      Date

  constructor(props: {
    id: string; name: string; description: string; icon: string
    coinsRequired: number; discount: number; discountEndsAt: Date | null
    type: string; isGlobal: boolean; isActive: boolean
    createdAt: Date; updatedAt: Date
  }) {
    this.id             = props.id
    this.name           = props.name
    this.description    = props.description
    this.icon           = props.icon
    this.coinsRequired  = props.coinsRequired
    this.discount       = props.discount
    this.discountEndsAt = props.discountEndsAt
    this.type           = props.type
    this.isGlobal       = props.isGlobal
    this.isActive       = props.isActive
    this.createdAt      = props.createdAt
    this.updatedAt      = props.updatedAt
    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2)
      throw new Error('El nombre de la recompensa debe tener al menos 2 caracteres')
    if (this.coinsRequired <= 0)
      throw new Error('Los coins requeridos deben ser mayores a cero')
    if (this.discount < 0 || this.discount > 100)
      throw new Error('El descuento debe estar entre 0 y 100')
  }
}
