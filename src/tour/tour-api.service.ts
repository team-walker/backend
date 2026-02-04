import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 한국관광공사 API에서 기본 관광지 목록을 가져와 Entity로 변환하여 반환
   */
  async fetchTourItems(pageNo = 1, numOfRows = 800): Promise<LandmarkEntity[]> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/areaBasedList2?serviceKey=${serviceKey}&MobileApp=AppTest&MobileOS=ETC&contentTypeId=12&areaCode=1&numOfRows=${numOfRows}&pageNo=${pageNo}&_type=json`;

    try {
      this.logger.log(`Fetching tour list (Page: ${pageNo})...`);
      const response = await firstValueFrom(this.httpService.get<TourApiResponse>(url));
      const { data } = response;

      const items = data?.response?.body?.items?.item;

      if (!items || !Array.isArray(items)) {
        this.logger.warn('No items found or invalid data structure');
        return [];
      }

      return items.map((item: TourApiItem) => LandmarkMapper.toLandmarkEntity(item));
    } catch (e) {
      this.logger.error(`Failed to fetch tour items: ${String(e)}`);
      throw e;
    }
  }

  /**
   * 단일 관광지의 상세 정보 API 호출 및 변환
   */
  async fetchLandmarkDetail(contentId: number): Promise<LandmarkDetailEntity | null> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailCommon2?serviceKey=${serviceKey}&MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=10&contentId=${contentId}&_type=json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiDetailItem>>(url),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return null;

      const rawItems = responseData.response.body.items.item;
      const item = Array.isArray(rawItems) ? rawItems[0] : rawItems;

      if (!item) return null;

      return LandmarkMapper.toLandmarkDetailEntity(item);
    } catch (e) {
      this.logger.error(`Failed to fetch detail for contentid: ${contentId}: ${e}`);
      return null;
    }
  }

  /**
   * 단일 관광지의 이미지 목록 API 호출 및 변환
   */
  async fetchLandmarkImages(contentId: number): Promise<LandmarkImageEntity[]> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailImage2?serviceKey=${serviceKey}&MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=50&contentId=${contentId}&imageYN=Y&_type=json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiImageItem>>(url),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return [];

      const rawItems = responseData.response.body.items.item;
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      return items.map((item) => LandmarkMapper.toLandmarkImageEntity(item));
    } catch (e) {
      this.logger.error(`Failed to fetch images for contentid: ${contentId}: ${e}`);
      return [];
    }
  }

  /**
   * 단일 관광지의 소개 정보 API 호출 및 변환
   */
  async fetchLandmarkIntro(contentId: number): Promise<LandmarkIntroEntity | null> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}/detailIntro2?serviceKey=${serviceKey}&MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=10&_type=json&contentTypeId=12&contentId=${contentId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TourApiNullableResponse<TourApiIntroItem>>(url),
      );
      const responseData = response.data;

      if (!responseData?.response?.body?.items?.item) return null;

      const rawItems = responseData.response.body.items.item;
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];
      const item = items[0];

      if (!item) return null;

      return LandmarkMapper.toLandmarkIntroEntity(item);
    } catch (e) {
      this.logger.error(`Failed to fetch intro for contentid: ${contentId}: ${e}`);
      return null;
    }
  }
}
