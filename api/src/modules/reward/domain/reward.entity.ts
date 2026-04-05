export interface RewardEntity {
  id:             string
  name:           string
  description:    string
  icon:           string
  coinsRequired:  number
  discount:       number
  discountEndsAt: Date | null
  type:           string
  isGlobal:       boolean
  isActive:       boolean
  createdAt:      Date
  updatedAt:      Date
}
