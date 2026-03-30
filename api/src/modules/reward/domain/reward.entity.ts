export interface RewardEntity {
  id:            string
  name:          string
  description:   string
  icon:          string
  coinsRequired: number
  type:          string
  isGlobal:      boolean
  isActive:      boolean
  createdAt:     Date
  updatedAt:     Date
}
