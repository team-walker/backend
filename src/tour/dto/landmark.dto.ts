import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LandmarkDto {
  @ApiProperty()
  contentid: number;

  @ApiPropertyOptional()
  contenttypeid?: number | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  addr1?: string | null;

  @ApiPropertyOptional()
  addr2?: string | null;

  @ApiPropertyOptional()
  zipcode?: string | null;

  @ApiPropertyOptional()
  tel?: string | null;

  @ApiPropertyOptional()
  areacode?: number | null;

  @ApiPropertyOptional()
  sigungucode?: number | null;

  @ApiPropertyOptional()
  cat1?: string | null;

  @ApiPropertyOptional()
  cat2?: string | null;

  @ApiPropertyOptional()
  cat3?: string | null;

  @ApiPropertyOptional()
  mapx?: number | null;

  @ApiPropertyOptional()
  mapy?: number | null;

  @ApiPropertyOptional()
  mlevel?: number | null;

  @ApiPropertyOptional()
  firstimage?: string | null;

  @ApiPropertyOptional()
  firstimage2?: string | null;

  @ApiPropertyOptional()
  cpyrhtdivcd?: string | null;

  @ApiPropertyOptional()
  createdtime?: string | null;

  @ApiPropertyOptional()
  modifiedtime?: string | null;

  @ApiPropertyOptional()
  ldongregncd?: number | null;

  @ApiPropertyOptional()
  ldongsigngucd?: number | null;

  @ApiPropertyOptional()
  lclssystm1?: string | null;

  @ApiPropertyOptional()
  lclssystm2?: string | null;

  @ApiPropertyOptional()
  lclssystm3?: string | null;
}
