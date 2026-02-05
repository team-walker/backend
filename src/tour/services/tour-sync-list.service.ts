import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { extractErrorMessage, logError } from '../../utils/error.util';
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

      const supabase = this.supabaseService.getClient();

      // 1. DB에 저장된 현재 데이터의 modifiedtime 가져오기
      const { data: existingData, error: fetchError } = await supabase
        .from('landmark')
        .select('contentid, modifiedtime');

      if (fetchError) {
        logError(this.logger, 'Error fetching existing landmarks', fetchError);
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
        if (!record.modifiedtime) return false;

        // 날짜 객체로 변환하여 밀리초 단위로 정확하게 비교
        // (문자열 비교는 DB의 포맷과 Mapper의 포맷 차이로 인해 부정확할 수 있음)
        const recordTime = new Date(record.modifiedtime).getTime();
        const existingTime = new Date(existingModifiedTime).getTime();

        return recordTime > existingTime;
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
        logError(this.logger, 'Supabase error during upsert', error);
        throw new Error(extractErrorMessage(error));
      }

      this.logger.log(`Data successfully synced! (${toUpdate.length} items updated)`);

      return { success: true, count: toUpdate.length };
    } catch (error) {
      logError(this.logger, 'Error syncing tour data', error);
      throw new Error(extractErrorMessage(error));
    }
  }
}
