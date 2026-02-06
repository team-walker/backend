import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegionTokenDto {
  @ApiPropertyOptional({ example: '' })
  code?: string;

  @ApiProperty({ example: '서울특별시' })
  longName: string;

  @ApiProperty({ example: '서울특별시' })
  shortName: string;

  @ApiProperty({ example: ['SIDO'] })
  types: string[];
}

export class LandmarksByRegionRequestDto {
  @ApiProperty({ type: [RegionTokenDto] })
  regions: RegionTokenDto[];
}
