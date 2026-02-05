import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { extractErrorMessage, logError } from '../utils/error.util';
import { LandmarkDetailEntity, LandmarkEntity } from './interfaces/landmark.interface';
import { LandmarkImageEntity } from './interfaces/landmark-image.interface';
import { LandmarkIntroEntity } from './interfaces/landmark-intro.interface';
import {
  TourApiDetailItem,
  TourApiImageItem,
  TourApiIntroItem,
  TourApiItem,
  TourApiNullableResponse,
  TourApiResponse,
} from './interfaces/tour-api-response.interface';
import { LandmarkMapper } from './utils/landmark.mapper';

@Injectable()
export class TourApiService {
  private readonly logger = new Logger(TourApiService.name);
  private readonly DEFAULT_NUM_OF_ROWS = 800;
  private readonly PAGE_DELAY = 200;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 한국관광공사 API에서 전체 관광지 목록을 페이지네이션하여 모두 가져옴
   */
  async fetchTourItems(numOfRows = this.DEFAULT_NUM_OF_ROWS): Promise<LandmarkEntity[]> {
    const allItems: LandmarkEntity[] = [];
    let pageNo = 1;

    try {
      // 1. 첫 페이지 조회로 전체 개수 확인
      const { items, totalCount } = await this.fetchTourItemsByPage(pageNo, numOfRows);
      allItems.push(...items);

      if (totalCount <= numOfRows) {
        return allItems;
      }

      const totalPages = Math.ceil(totalCount / numOfRows);
      this.logger.log(`Total items: ${totalCount}, Total pages: ${totalPages}`);

      // 2. 나머지 페이지 순회
      for (pageNo = 2; pageNo <= totalPages; pageNo++) {
        await new Promise((resolve) => setTimeout(resolve, this.PAGE_DELAY)); // Rate limit 방지
        const { items: pageItems } = await this.fetchTourItemsByPage(pageNo, numOfRows);
        allItems.push(...pageItems);
      }

      return allItems;
    } catch (e) {
      logError(this.logger, 'Failed to fetch all tour items', e);
      throw new Error(extractErrorMessage(e));
    }
  }

  /**
   * 특정 페이지의 관광지 목록 조회 (내부 사용)
   */
  private async fetchTourItemsByPage(
    pageNo: number,
    numOfRows: number,
  ): Promise<{ items: LandmarkEntity[]; totalCount: number }> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/areaBasedList2`;

    try {
      this.logger.log(`Fetching tour list (Page: ${pageNo})...`);
      const response = await firstValueFrom(
        this.httpService.get<TourApiResponse>(url, {
          params: {
            serviceKey,
            MobileApp: 'AppTest',
            MobileOS: 'ETC',
            contentTypeId: 12,
            areaCode: 1,
            numOfRows,
            pageNo,
            _type: 'json',
          },
        }),
      );
      const { data } = response;
      const body = data?.response?.body;

      const rawItems = body?.items?.item;
      const totalCount = body?.totalCount || 0;

      if (!rawItems) {
        this.logger.warn(`No items found on page ${pageNo}`);
        return { items: [], totalCount };
      }

      const items = Array.isArray(rawItems) ? rawItems : [rawItems];
      const entities = items.map((item: TourApiItem) => LandmarkMapper.toLandmarkEntity(item));

      return { items: entities, totalCount };
    } catch (e) {
      logError(this.logger, `Failed to fetch tour page ${pageNo}`, e);
      throw new Error(extractErrorMessage(e));
    }
  }

  /**
   * 단일 관광지의 상세 정보 API 호출 및 변환
   */
  async fetchLandmarkDetail(contentId: number): Promise<LandmarkDetailEntity | null> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailCommon2`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiDetailItem>>(url, {
          params: {
            serviceKey,
            MobileApp: 'AppTest',
            MobileOS: 'ETC',
            pageNo: 1,
            numOfRows: 10,
            contentId,
            _type: 'json',
          },
        }),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return null;

      const rawItems = responseData.response.body.items.item;
      const item = Array.isArray(rawItems) ? rawItems[0] : rawItems;

      if (!item) return null;

      return LandmarkMapper.toLandmarkDetailEntity(item);
    } catch (e) {
      logError(this.logger, `Failed to fetch detail for contentid: ${contentId}`, e);
      return null;
    }
  }

  /**
   * 단일 관광지의 이미지 목록 API 호출 및 변환
   */
  async fetchLandmarkImages(contentId: number): Promise<LandmarkImageEntity[]> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailImage2`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiImageItem>>(url, {
          params: {
            serviceKey,
            MobileApp: 'AppTest',
            MobileOS: 'ETC',
            pageNo: 1,
            numOfRows: 50,
            contentId,
            imageYN: 'Y',
            _type: 'json',
          },
        }),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return [];

      const rawItems = responseData.response.body.items.item;
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      return items.map((item) => LandmarkMapper.toLandmarkImageEntity(item));
    } catch (e) {
      logError(this.logger, `Failed to fetch images for contentid: ${contentId}`, e);
      return [];
    }
  }

  /**
   * 단일 관광지의 소개 정보 API 호출 및 변환
   */
  async fetchLandmarkIntro(contentId: number): Promise<LandmarkIntroEntity | null> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailIntro2`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiIntroItem>>(url, {
          params: {
            serviceKey,
            MobileApp: 'AppTest',
            MobileOS: 'ETC',
            pageNo: 1,
            numOfRows: 10,
            _type: 'json',
            contentTypeId: 12,
            contentId,
          },
        }),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return null;

      const rawItems = responseData.response.body.items.item;
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];
      const item = items[0];

      if (!item) return null;

      return LandmarkMapper.toLandmarkIntroEntity(item);
    } catch (e) {
      logError(this.logger, `Failed to fetch intro for contentid: ${contentId}`, e);
      return null;
    }
  }
}
