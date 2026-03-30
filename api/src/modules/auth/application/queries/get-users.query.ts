import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../domain/user.repository'
import { UserMapper }     from '../user.mapper'
import type { UserResponse } from '@control-aula/shared'

export class GetUsersQuery {}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, UserResponse[]> {
  constructor(private readonly repo: UserRepository) {}

  async execute(): Promise<UserResponse[]> {
    const users = await this.repo.findAll()
    return users.map(UserMapper.toResponse)
  }
}
