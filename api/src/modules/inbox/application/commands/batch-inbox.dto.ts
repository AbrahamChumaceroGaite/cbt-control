import { IsArray, IsIn, IsOptional, IsString } from 'class-validator'

export class BatchInboxDto {
  @IsIn(['mark-all-read', 'delete-many', 'delete-all']) action!: string
  @IsOptional() @IsArray() @IsString({ each: true }) ids?: string[]
}
