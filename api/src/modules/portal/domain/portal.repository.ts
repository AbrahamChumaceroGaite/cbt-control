import type { PortalStudentResponse } from '@control-aula/shared'

export abstract class PortalRepository {
  abstract getStudentData(studentId: string): Promise<PortalStudentResponse | null>
  abstract requestReward(studentId: string, rewardId: string): Promise<{ id: string; status: string }>
  abstract getIndividualRewards(studentId: string): Promise<{ id: string; name: string; icon: string; coinsRequired: number; description: string }[]>
}
