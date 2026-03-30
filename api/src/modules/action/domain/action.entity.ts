export interface ActionEntity {
  id:             string
  name:           string
  coins:          number
  category:       string
  affectsClass:   boolean
  affectsStudent: boolean
  isActive:       boolean
  createdAt:      Date
  updatedAt:      Date
}
