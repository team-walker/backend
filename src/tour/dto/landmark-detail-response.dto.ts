import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LandmarkDetailDto {
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

  @ApiPropertyOptional()
  homepage?: string | null;

  @ApiPropertyOptional()
  overview?: string | null;
}

export class LandmarkImageDto {
  @ApiProperty()
  contentid: number;

  @ApiProperty()
  originimgurl: string;

  @ApiProperty()
  imgname: string;

  @ApiPropertyOptional()
  smallimageurl?: string | null;

  @ApiPropertyOptional()
  cpyrhtdivcd?: string | null;

  @ApiPropertyOptional()
  serialnum?: string | null;
}

export class LandmarkIntroDto {
  @ApiProperty()
  contentid: number;

  @ApiProperty()
  contenttypeid: number;

  @ApiPropertyOptional()
  heritage1?: boolean | null;

  @ApiPropertyOptional()
  heritage2?: boolean | null;

  @ApiPropertyOptional()
  heritage3?: boolean | null;

  @ApiPropertyOptional()
  infocenter?: string | null;

  @ApiPropertyOptional()
  opendate?: string | null;

  @ApiPropertyOptional()
  restdate?: string | null;

  @ApiPropertyOptional()
  expguide?: string | null;

  @ApiPropertyOptional()
  expagerange?: string | null;

  @ApiPropertyOptional()
  accomcount?: string | null;

  @ApiPropertyOptional()
  useseason?: string | null;

  @ApiPropertyOptional()
  usetime?: string | null;

  @ApiPropertyOptional()
  parking?: string | null;

  @ApiPropertyOptional()
  chkbabycarriage?: boolean | null;

  @ApiPropertyOptional()
  chkpet?: boolean | null;

  @ApiPropertyOptional()
  chkcreditcard?: boolean | null;
}

export class LandmarkDetailResponseDto {
  @ApiProperty({ type: LandmarkDetailDto })
  detail: LandmarkDetailDto;

  @ApiProperty({ type: [LandmarkImageDto] })
  images: LandmarkImageDto[];

  @ApiPropertyOptional({ type: LandmarkIntroDto, nullable: true })
  intro?: LandmarkIntroDto | null;
}
