export interface LandmarkEntity {
  contentid: number;
  contenttypeid: number | null;
  title: string;
  addr1: string | null;
  addr2: string | null;
  zipcode: string | null;
  tel: string | null;
  areacode: number | null;
  sigungucode: number | null;
  cat1: string | null;
  cat2: string | null;
  cat3: string | null;
  mapx: number | null;
  mapy: number | null;
  mlevel: number | null;
  firstimage: string | null;
  firstimage2: string | null;
  cpyrhtdivcd: string | null;
  createdtime: string | null;
  modifiedtime: string | null;
  ldongregncd: number | null;
  ldongsigngucd: number | null;
  lclssystm1: string | null;
  lclssystm2: string | null;
  lclssystm3: string | null;
}

export interface LandmarkDetailEntity extends LandmarkEntity {
  homepage: string | null;
  overview: string | null;
}
