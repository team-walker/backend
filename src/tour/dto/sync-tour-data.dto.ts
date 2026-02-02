import { ApiProperty } from '@nestjs/swagger';

export class SyncTourDataResponseDto {
  @ApiProperty({ description: 'Whether the synchronization was successful' })
  success: boolean;

  @ApiProperty({ description: 'Number of items synchronized', required: false })
  count?: number;

  @ApiProperty({ description: 'Error message if failed', required: false })
  message?: string;
}
