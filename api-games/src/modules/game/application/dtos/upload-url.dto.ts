import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export class UploadUrlDto {
  /** Original filename — used to preserve extension in the object path */
  @IsString()
  @IsNotEmpty()
  filename!: string

  /** Which slot this file occupies on the game */
  @IsIn(['game', 'bios', 'cover'])
  fileType!: 'game' | 'bios' | 'cover'
}
