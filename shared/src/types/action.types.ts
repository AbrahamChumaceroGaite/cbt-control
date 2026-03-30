export type ActionResponse = {
  id:             string
  name:           string
  coins:          number
  category:       string
  affectsClass:   boolean
  affectsStudent: boolean
  isActive:       boolean
}

export type ActionInput = {
  name:            string
  coins:           number
  category?:       string
  affectsClass?:   boolean
  affectsStudent?: boolean
  isActive?:       boolean
}
