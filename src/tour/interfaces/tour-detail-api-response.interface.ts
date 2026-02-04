export interface TourDetailApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: TourDetailApiItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface TourDetailApiItem {
  contentid: string; // "126128"
  contenttypeid: string; // "12"
  title: string; // "동촌유원지"
  createdtime: string; // "20031105090000"
  modifiedtime: string; // "20250425092225"
  tel: string;
  telname: string;
  homepage: string; // HTML string containing URL
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  areacode: string;
  sigungucode: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  cat1: string;
  cat2: string;
  cat3: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  overview: string;
}
