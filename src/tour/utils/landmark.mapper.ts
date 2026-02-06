import { LandmarkDetailEntity, LandmarkEntity } from '../interfaces/landmark.interface';
import { LandmarkImageEntity } from '../interfaces/landmark-image.interface';
import { LandmarkIntroEntity } from '../interfaces/landmark-intro.interface';
import {
  TourApiDetailItem,
  TourApiImageItem,
  TourApiIntroItem,
  TourApiItem,
} from '../interfaces/tour-api-response.interface';
import { parseStringToBoolean } from './helpers/boolean.helper';
import { parseToSafeFloat, parseToSafeInteger } from './helpers/number.helper';
import { formatApiTimestamp } from './helpers/timestamp.helper';

export class LandmarkMapper {
  static toLandmarkEntity(item: TourApiItem): LandmarkEntity {
    return {
      contentid:
        parseToSafeInteger(item.contentid) ??
        (() => {
          throw new Error('Invalid contentid');
        })(),
      contenttypeid: parseToSafeInteger(item.contenttypeid) ?? 0,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseToSafeInteger(item.areacode) ?? 0,
      sigungucode: parseToSafeInteger(item.sigungucode) ?? 0,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseToSafeFloat(item.mapx) ?? 0,
      mapy: parseToSafeFloat(item.mapy) ?? 0,
      mlevel: parseToSafeInteger(item.mlevel) ?? 0,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: formatApiTimestamp(item.createdtime),
      modifiedtime: formatApiTimestamp(item.modifiedtime),
      ldongregncd: parseToSafeInteger(item.lDongRegnCd),
      ldongsigngucd: parseToSafeInteger(item.lDongSignguCd),
      lclssystm1: item.lclsSystm1 ?? null,
      lclssystm2: item.lclsSystm2 ?? null,
      lclssystm3: item.lclsSystm3 ?? null,
    };
  }

  static toLandmarkDetailEntity(item: TourApiDetailItem): LandmarkDetailEntity {
    return {
      contentid: parseToSafeInteger(item.contentid) ?? 0,
      contenttypeid: parseToSafeInteger(item.contenttypeid) ?? 0,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseToSafeInteger(item.areacode) ?? 0,
      sigungucode: parseToSafeInteger(item.sigungucode) ?? 0,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseToSafeFloat(item.mapx) ?? 0,
      mapy: parseToSafeFloat(item.mapy) ?? 0,
      mlevel: parseToSafeInteger(item.mlevel) ?? 0,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: formatApiTimestamp(item.createdtime),
      modifiedtime: formatApiTimestamp(item.modifiedtime),
      ldongregncd: parseToSafeInteger(item.lDongRegnCd),
      ldongsigngucd: parseToSafeInteger(item.lDongSignguCd),
      lclssystm1: item.lclsSystm1 ?? null,
      lclssystm2: item.lclsSystm2 ?? null,
      lclssystm3: item.lclsSystm3 ?? null,
      homepage: item.homepage ?? null,
      overview: item.overview ?? null,
    };
  }

  static toLandmarkImageEntity(item: TourApiImageItem): LandmarkImageEntity {
    return {
      contentid: parseToSafeInteger(item.contentid) ?? 0,
      originimgurl: item.originimgurl,
      imgname: item.imgname,
      smallimageurl: item.smallimageurl ?? null,
      cpyrhtdivcd: item.cpyrhtDivCd ?? null,
      serialnum: item.serialnum ?? null,
    };
  }

  static toLandmarkIntroEntity(item: TourApiIntroItem): LandmarkIntroEntity {
    return {
      contentid: parseToSafeInteger(item.contentid) ?? 0,
      contenttypeid: parseToSafeInteger(item.contenttypeid) ?? 0,
      heritage1: item.heritage1 === '1',
      heritage2: item.heritage2 === '1',
      heritage3: item.heritage3 === '1',
      infocenter: item.infocenter,
      opendate: item.opendate,
      restdate: item.restdate,
      expguide: item.expguide,
      expagerange: item.expagerange,
      accomcount: item.accomcount,
      useseason: item.useseason,
      usetime: item.usetime,
      parking: item.parking,
      chkbabycarriage: parseStringToBoolean(item.chkbabycarriage),
      chkpet: parseStringToBoolean(item.chkpet),
      chkcreditcard: parseStringToBoolean(item.chkcreditcard),
    };
  }
}
