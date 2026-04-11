export class ActionEntity {
  readonly id:             string
  readonly name:           string
  readonly coins:          number
  readonly category:       string
  readonly affectsClass:   boolean
  readonly affectsStudent: boolean
  readonly isActive:       boolean
  readonly createdAt:      Date
  readonly updatedAt:      Date

  constructor(props: {
    id:             string
    name:           string
    coins:          number
    category:       string
    affectsClass:   boolean
    affectsStudent: boolean
    isActive:       boolean
    createdAt:      Date
    updatedAt:      Date
  }) {
    this.id             = props.id
    this.name           = props.name
    this.coins          = props.coins
    this.category       = props.category
    this.affectsClass   = props.affectsClass
    this.affectsStudent = props.affectsStudent
    this.isActive       = props.isActive
    this.createdAt      = props.createdAt
    this.updatedAt      = props.updatedAt
    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2)
      throw new Error('El nombre de la acción debe tener al menos 2 caracteres')
    if (this.coins === 0)
      throw new Error('Los coins de la acción no pueden ser cero')
    if (!this.affectsClass && !this.affectsStudent)
      throw new Error('La acción debe afectar al menos a la clase o al estudiante')
  }
}
