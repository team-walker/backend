import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ description: 'The content ID of the landmark', example: 126508 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  contentId!: number;
}
