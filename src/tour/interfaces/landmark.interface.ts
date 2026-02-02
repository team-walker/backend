export interface LandmarkEntity {
  contentid: number;
  contenttypeid: number;
  title: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  tel: string;
  areacode: number;
  sigungucode: number;
  cat1: string;
  cat2: string;
  cat3: string;
  mapx: number;
  mapy: number;
  mlevel: number;
  firstimage: string;
  firstimage2: string;
  cpyrhtdivcd: string;
  createdtime: string | null;
  modifiedtime: string | null;
  ldongregncd: number | null;
  ldongsigngucd: number | null;
  lclssystm1: string | null;
  lclssystm2: string | null;
  lclssystm3: string | null;
}
