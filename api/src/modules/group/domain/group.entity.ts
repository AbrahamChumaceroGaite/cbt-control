export interface GroupMemberEntity {
  id:        string
  studentId: string
  student:   { id: string; name: string; coins: number }
}

export class GroupEntity {
  readonly id:        string
  readonly name:      string
  readonly courseId:  string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly members:   GroupMemberEntity[]

  constructor(props: {
    id:        string
    name:      string
    courseId:  string
    createdAt: Date
    updatedAt: Date
    members:   GroupMemberEntity[]
  }) {
    this.id        = props.id
    this.name      = props.name
    this.courseId  = props.courseId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
    this.members   = props.members
    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2)
      throw new Error('El nombre del grupo debe tener al menos 2 caracteres')
    if (!this.courseId || this.courseId.trim().length === 0)
      throw new Error('El curso del grupo es requerido')
  }
}
