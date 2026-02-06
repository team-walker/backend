import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { getErrorMessage, logErrorWithContext } from '../utils/error.util';
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

  async fetchLandmarkList(numOfRows = this.DEFAULT_NUM_OF_ROWS): Promise<LandmarkEntity[]> {
    const allItems: LandmarkEntity[] = [];
    let pageNo = 1;

    try {
      const { items, totalCount } = await this.fetchLandmarkListPage(pageNo, numOfRows);
      allItems.push(...items);

      if (totalCount <= numOfRows) {
        return allItems;
      }

      const totalPages = Math.ceil(totalCount / numOfRows);
      this.logger.log(`Total items: ${totalCount}, Total pages: ${totalPages}`);

      for (pageNo = 2; pageNo <= totalPages; pageNo++) {
        await new Promise((resolve) => setTimeout(resolve, this.PAGE_DELAY));
        const { items: pageItems } = await this.fetchLandmarkListPage(pageNo, numOfRows);
        allItems.push(...pageItems);
      }

      return allItems;
    } catch (e) {
      logErrorWithContext(this.logger, 'Failed to fetch all tour items', e);
      throw new Error(getErrorMessage(e));
    }
  }

  private async fetchLandmarkListPage(
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
      logErrorWithContext(this.logger, `Failed to fetch tour page ${pageNo}`, e);
      throw new Error(getErrorMessage(e));
    }
  }

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
      logErrorWithContext(this.logger, `Failed to fetch detail for contentid: ${contentId}`, e);
      return null;
    }
  }

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
      logErrorWithContext(this.logger, `Failed to fetch images for contentid: ${contentId}`, e);
      return [];
    }
  }

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
      logErrorWithContext(this.logger, `Failed to fetch intro for contentid: ${contentId}`, e);
      return null;
    }
  }
}
