export interface TourApiItem {
  addr1: string;
  addr2: string;
  areacode: string;
  cat1: string;
  cat2: string;
  cat3: string;
  contentid: string;
  contenttypeid: string;
  createdtime: string;
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  modifiedtime: string;
  sigungucode: string;
  tel: string;
  title: string;
  zipcode: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  lclsSystm1?: string;
  lclsSystm2?: string;
  lclsSystm3?: string;
}

export interface TourApiDetailItem extends TourApiItem {
  homepage?: string;
  overview?: string;
}

export interface TourApiImageItem {
  contentid: string;
  originimgurl: string;
  imgname: string;
  smallimageurl: string;
  cpyrhtDivCd: string;
  serialnum: string;
}

export interface TourApiIntroItem {
  contentid: string;
  contenttypeid: string;
  heritage1: string;
  heritage2: string;
  heritage3: string;
  infocenter: string;
  opendate: string;
  restdate: string;
  expguide: string;
  expagerange: string;
  accomcount: string;
  useseason: string;
  usetime: string;
  parking: string;
  chkbabycarriage: string;
  chkpet: string;
  chkcreditcard: string;
}

export interface TourApiAreaCodeItem {
  code: string;
  name: string;
}

export interface TourApiResponse<T = TourApiItem> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[] | T;
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface TourApiNullableResponse<T> {
  response?: {
    body?: {
      items?: {
        item?: T | T[];
      };
    };
  };
}
