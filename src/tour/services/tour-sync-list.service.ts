import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../../database.types';
import { SupabaseService } from '../../supabase/supabase.service';
import { SyncTourDataResponseDto } from '../dto/sync-tour-data.dto';
import { LandmarkEntity } from '../interfaces/landmark.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncListService {
  private readonly logger = new Logger(TourSyncListService.name);

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Phase 1: 기본 관광지 목록 동기화
   */
  async sync(): Promise<SyncTourDataResponseDto> {
    try {
      this.logger.log('Fetching tour data from external API...');

      const records: LandmarkEntity[] = await this.tourApiService.fetchTourItems();

      if (!records || records.length === 0) {
        this.logger.error('No items found or invalid structure');
        return { success: false, message: 'No items found' };
      }

      this.logger.log(`Fetched ${records.length} items from API. Checking for updates...`);

      const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;

      // 1. DB에 저장된 현재 데이터의 modifiedtime 가져오기
      const { data: existingData, error: fetchError } = await supabase
        .from('landmark')
        .select('contentid, modifiedtime');

      if (fetchError) {
        this.logger.error(`Error fetching existing landmarks: ${fetchError.message}`);
        // 에러 발생 시 안전하게 전체 upsert 진행하거나 에러 처리
      }

      const existingMap = new Map(
        existingData?.map((item) => [item.contentid, item.modifiedtime]) || [],
      );

      // 2. 변경된 데이터 또는 신규 데이터만 필터링
      const toUpdate = records.filter((record) => {
        const existingModifiedTime = existingMap.get(record.contentid);

        // 신규 데이터인 경우
        if (!existingModifiedTime) return true;

        // API의 modifiedtime이 DB의 것보다 최신인 경우
        // (API 데이터 형식에 따라 문자열 비교 또는 Date 변환 비교)
        return !!record.modifiedtime && record.modifiedtime > existingModifiedTime;
      });

      if (toUpdate.length === 0) {
        this.logger.log('No changes detected. Skipping update.');
        return { success: true, count: 0 };
      }

      this.logger.log(
        `${toUpdate.length} items changed or new. Updating ${toUpdate.length} / ${records.length} items...`,
      );

      const { error } = await supabase
        .from('landmark')
        .upsert(toUpdate, { onConflict: 'contentid' });

      if (error) {
        this.logger.error(`Supabase error: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Data successfully synced! (${toUpdate.length} items updated)`);

      return { success: true, count: toUpdate.length };
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
