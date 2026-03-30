export type RewardResponse = {
  id:            string
  name:          string
  description:   string
  icon:          string
  coinsRequired: number
  type:          string
  isGlobal:      boolean
  isActive:      boolean
}

export type RewardInput = {
  name:           string
  coinsRequired:  number
  description?:   string
  icon?:          string
  type?:          string
  isGlobal?:      boolean
  isActive?:      boolean
}

export type RedemptionResponse = {
  id:        string
  status:    string
  createdAt: string
  notes:     string
  reward:    { name: string; icon: string; coinsRequired: number }
}

/** Solicitud de canje con relaciones completas (lista de administración) */
export type RedemptionFullResponse = {
  id:        string
  status:    string
  createdAt: string
  notes:     string
  student:   { id: string; name: string; coins: number; course: { name: string } }
  reward:    { name: string; icon: string; coinsRequired: number }
}
