import { LandmarkDetailEntity, LandmarkEntity } from '../interfaces/landmark.interface';
import { LandmarkImageEntity } from '../interfaces/landmark-image.interface';
import { LandmarkIntroEntity } from '../interfaces/landmark-intro.interface';
import {
  TourApiDetailItem,
  TourApiImageItem,
  TourApiIntroItem,
  TourApiItem,
} from '../interfaces/tour-api-response.interface';

export class LandmarkMapper {
  /**
   * TourApiItem (목록 조회 결과) -> LandmarkEntity 변환
   */
  static toLandmarkEntity(item: TourApiItem): LandmarkEntity {
    return {
      contentid: parseInt(item.contentid, 10),
      contenttypeid: parseInt(item.contenttypeid, 10),
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseInt(item.areacode, 10),
      sigungucode: parseInt(item.sigungucode, 10),
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseFloat(item.mapx),
      mapy: parseFloat(item.mapy),
      mlevel: parseInt(item.mlevel, 10),
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: this.parseTimestamp(item.createdtime),
      modifiedtime: this.parseTimestamp(item.modifiedtime),
      ldongregncd: item.lDongRegnCd ? parseInt(item.lDongRegnCd, 10) : null,
      ldongsigngucd: item.lDongSignguCd ? parseInt(item.lDongSignguCd, 10) : null,
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
      contentid: parseInt(item.contentid, 10),
      contenttypeid: parseInt(item.contenttypeid, 10),
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      zipcode: item.zipcode,
      tel: item.tel,
      areacode: parseInt(item.areacode, 10),
      sigungucode: parseInt(item.sigungucode, 10),
      cat1: item.cat1,
      cat2: item.cat2,
      cat3: item.cat3,
      mapx: parseFloat(item.mapx),
      mapy: parseFloat(item.mapy),
      mlevel: parseInt(item.mlevel, 10),
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      cpyrhtdivcd: item.cpyrhtDivCd,
      createdtime: this.parseTimestamp(item.createdtime),
      modifiedtime: this.parseTimestamp(item.modifiedtime),
      ldongregncd: item.lDongRegnCd ? parseInt(item.lDongRegnCd, 10) : null,
      ldongsigngucd: item.lDongSignguCd ? parseInt(item.lDongSignguCd, 10) : null,
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
      contentid: parseInt(item.contentid, 10),
      originimgurl: item.originimgurl,
      imgname: item.imgname,
      smallimageurl: item.smallimageurl,
      cpyrhtdivcd: item.cpyrhtDivCd,
      serialnum: item.serialnum,
    };
  }

  /**
   * TourApiIntroItem (소개 정보) -> LandmarkIntroEntity 변환
   */
  static toLandmarkIntroEntity(item: TourApiIntroItem): LandmarkIntroEntity {
    return {
      contentid: parseInt(item.contentid, 10),
      contenttypeid: parseInt(item.contenttypeid, 10),
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
      chkbabycarriage: this.parseBoolean(item.chkbabycarriage),
      chkpet: this.parseBoolean(item.chkpet),
      chkcreditcard: this.parseBoolean(item.chkcreditcard),
    };
  }

  // --- Helpers ---

  /**
   * YYYYMMDDHHMMSS -> YYYY-MM-DD HH:MM:SS
   */
  private static parseTimestamp(str: string): string | null {
    if (!str || str.length !== 14) return null;
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`;
  }

  /**
   * String -> Boolean
   */
  private static parseBoolean(val: string): boolean {
    if (!val) return false;
    const s = val.trim();
    if (s === '0' || s === '없음' || s === '불가') return false;
    return true;
  }
}
