import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';

import { Database } from '../database.types';
import { SupabaseService } from '../supabase/supabase.service';
import { SyncTourDataResponseDto } from './dto/sync-tour-data.dto';
import { LandmarkEntity } from './interfaces/landmark.interface';
import { TourApiItem, TourApiResponse } from './interfaces/tour-api-response.interface';

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  // 매주 월요일 자정에 실행 (Week start set to Monday for automatic sync)
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySync() {
    this.logger.log('Starting weekly tour data synchronization...');
    try {
      const result = await this.syncTourData();
      this.logger.log(`Weekly synchronization completed. Processed ${result.count} items.`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Weekly synchronization failed: ${error.message}`);
      } else {
        this.logger.error(`Weekly synchronization failed: ${String(error)}`);
      }
    }
  }

  async syncTourData(): Promise<SyncTourDataResponseDto> {
    const baseUrl = this.configService.getOrThrow<string>('TOUR_API_URL');
    const serviceKey = this.configService.getOrThrow<string>('TOUR_API_KEY');
    const url = `${baseUrl}?serviceKey=${serviceKey}&MobileApp=AppTest&MobileOS=ETC&contentTypeId=12&areaCode=1&numOfRows=800&pageNo=1&_type=json`;

    try {
      this.logger.log('Fetching tour data from external API...');
      const response = await firstValueFrom(this.httpService.get<TourApiResponse>(url));
      const { data } = response;

      const items = data?.response?.body?.items?.item;

      if (!items || !Array.isArray(items)) {
        this.logger.error('Invalid data structure received');
        return { success: false, message: 'No items found' };
      }

      this.logger.log(`Fetched ${items.length} items. Inserting into Supabase...`);

      const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;

      // Transform items to match your Supabase table schema
      const records: LandmarkEntity[] = items.map((item: TourApiItem) => {
        // Helper to formatting timestamp YYYYMMDDHHMMSS -> YYYY-MM-DD HH:MM:SS
        const parseDate = (str: string) => {
          if (!str || str.length !== 14) return null;
          return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`;
        };

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
          createdtime: parseDate(item.createdtime),
          modifiedtime: parseDate(item.modifiedtime),
          ldongregncd: item.lDongRegnCd ? parseInt(item.lDongRegnCd, 10) : null,
          ldongsigngucd: item.lDongSignguCd ? parseInt(item.lDongSignguCd, 10) : null,
          lclssystm1: item.lclsSystm1 ?? null,
          lclssystm2: item.lclsSystm2 ?? null,
          lclssystm3: item.lclsSystm3 ?? null,
        };
      });

      // Upsert data to avoid duplicates (assuming contentid is unique content)

      const { error } = await supabase
        .from('landmark')
        .upsert(records, { onConflict: 'contentid' });

      if (error) {
        this.logger.error(`Supabase error: ${error.message}`);

        throw new Error(error.message);
      }

      this.logger.log('Data successfully synced!');

      return { success: true, count: records.length };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error syncing tour data: ${error.message}`);
      } else {
        this.logger.error(`Error syncing tour data: ${String(error)}`);
      }
      throw error;
    }
  }
}
