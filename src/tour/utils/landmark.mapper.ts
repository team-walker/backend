import { LandmarkDetailEntity, LandmarkEntity } from '../interfaces/landmark.interface';
import { LandmarkImageEntity } from '../interfaces/landmark-image.interface';
import { LandmarkIntroEntity } from '../interfaces/landmark-intro.interface';
import {
  TourApiDetailItem,
  TourApiImageItem,
  TourApiIntroItem,
  TourApiItem,
} from '../interfaces/tour-api-response.interface';
import { parseBoolean } from './helpers/boolean.helper';
import { parseSafeFloat, parseSafeInt } from './helpers/number.helper';
import { parseTimestamp } from './helpers/timestamp.helper';

export class LandmarkMapper {
  /**
   * TourApiItem (목록 조회 결과) -> LandmarkEntity 변환
   */
  static toLandmarkEntity(item: TourApiItem): LandmarkEntity {
    return {
      contentid: parseSafeInt(item.contentid) ?? 0,
      contenttypeid: parseSafeInt(item.contenttypeid) ?? 0,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseSafeInt(item.areacode) ?? 0,
      sigungucode: parseSafeInt(item.sigungucode) ?? 0,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseSafeFloat(item.mapx) ?? 0,
      mapy: parseSafeFloat(item.mapy) ?? 0,
      mlevel: parseSafeInt(item.mlevel) ?? 0,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: parseTimestamp(item.createdtime),
      modifiedtime: parseTimestamp(item.modifiedtime),
      ldongregncd: parseSafeInt(item.lDongRegnCd),
      ldongsigngucd: parseSafeInt(item.lDongSignguCd),
      lclssystm1: item.lclsSystm1 ?? null,
      lclssystm2: item.lclsSystm2 ?? null,
      lclssystm3: item.lclsSystm3 ?? null,
    };
  }

  /**
   * TourApiDetailItem (공통 상세 정보) -> LandmarkDetailEntity 변환
   */
  static toLandmarkDetailEntity(item: TourApiDetailItem): LandmarkDetailEntity {
    return {
      contentid: parseSafeInt(item.contentid) ?? 0,
      contenttypeid: parseSafeInt(item.contenttypeid) ?? 0,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseSafeInt(item.areacode) ?? 0,
      sigungucode: parseSafeInt(item.sigungucode) ?? 0,
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseSafeFloat(item.mapx) ?? 0,
      mapy: parseSafeFloat(item.mapy) ?? 0,
      mlevel: parseSafeInt(item.mlevel) ?? 0,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: parseTimestamp(item.createdtime),
      modifiedtime: parseTimestamp(item.modifiedtime),
      ldongregncd: parseSafeInt(item.lDongRegnCd),
      ldongsigngucd: parseSafeInt(item.lDongSignguCd),
      lclssystm1: item.lclsSystm1 ?? null,
      lclssystm2: item.lclsSystm2 ?? null,
      lclssystm3: item.lclsSystm3 ?? null,
      homepage: item.homepage ?? null,
      overview: item.overview ?? null,
    };
  }

  /**
   * TourApiImageItem (이미지 상세) -> LandmarkImageEntity 변환
   */
  static toLandmarkImageEntity(item: TourApiImageItem): LandmarkImageEntity {
    return {
      contentid: parseSafeInt(item.contentid) ?? 0,
      originimgurl: item.originimgurl,
      imgname: item.imgname,
      smallimageurl: item.smallimageurl ?? null,
      cpyrhtdivcd: item.cpyrhtDivCd ?? null,
      serialnum: item.serialnum ?? null,
    };
  }

  /**
   * TourApiIntroItem (소개 정보) -> LandmarkIntroEntity 변환
   */
  static toLandmarkIntroEntity(item: TourApiIntroItem): LandmarkIntroEntity {
    return {
      contentid: parseSafeInt(item.contentid) ?? 0,
      contenttypeid: parseSafeInt(item.contenttypeid) ?? 0,
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
      chkbabycarriage: parseBoolean(item.chkbabycarriage),
      chkpet: parseBoolean(item.chkpet),
      chkcreditcard: parseBoolean(item.chkcreditcard),
    };
  }
}
