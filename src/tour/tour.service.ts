import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SupabaseService } from '../supabase/supabase.service';
import { extractErrorMessage, logError } from '../utils/error.util';
import { TourSyncDetailService } from './services/tour-sync-detail.service';
import { TourSyncImageService } from './services/tour-sync-image.service';
import { TourSyncIntroService } from './services/tour-sync-intro.service';
import { TourSyncListService } from './services/tour-sync-list.service';

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly tourSyncListService: TourSyncListService,
    private readonly tourSyncDetailService: TourSyncDetailService,
    private readonly tourSyncImageService: TourSyncImageService,
    private readonly tourSyncIntroService: TourSyncIntroService,
  ) {}

  /**
   * 매주 월요일 자정에 실행되는 정기 데이터 동기화 작업
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySync() {
    await this.syncAllTourData();
  }

  /**
   * 모든 단계의 관광 데이터를 순차적으로 동기화하는 메인 프로세스
   * (목록 조회 -> 상세 정보 -> 이미지 -> 소개 정보)
   */
  async syncAllTourData() {
    this.logger.log('Starting full tour data synchronization...');
    try {
      const result = await this.tourSyncListService.sync();
      this.logger.log(`Phase 1: List synchronization completed. Processed ${result.count} items.`);

      this.logger.log('Phase 2: Starting detailed tour data synchronization...');
      // 상세 정보 동기화 시, 업데이트 된(또는 새로 추가된) contentId 목록을 반환받음
      const changedContentIds = await this.tourSyncDetailService.sync();
      this.logger.log(
        `Phase 2: Detailed synchronization completed. (Updated ${changedContentIds.length} items)`,
      );

      this.logger.log('Phase 3: Starting landmark images synchronization...');
      // 변경된 항목들은 강제로 이미지도 다시 동기화
      await this.tourSyncImageService.sync(changedContentIds);
      this.logger.log('Phase 3: Images synchronization completed.');

      this.logger.log('Phase 4: Starting landmark intro synchronization...');
      // 변경된 항목들은 강제로 소개 정보도 다시 동기화
      await this.tourSyncIntroService.sync(changedContentIds);
      this.logger.log('Phase 4: Intro synchronization completed.');

      return { success: true, message: 'Full synchronization completed', count: result.count };
    } catch (error) {
      logError(this.logger, 'Full synchronization failed', error);
      throw new Error(`Synchronization failed: ${extractErrorMessage(error)}`);
    }
  }

  /**
   * 한국관광공사 API에서 기본 관광지 목록을 가져와 DB에 저장
   */
  async syncTourData() {
    return this.tourSyncListService.sync();
  }

  /**
   * 각 관광지의 상세 정보(개요, 홈페이지 등)를 동기화
   */
  async syncLandmarkDetails() {
    return this.tourSyncDetailService.sync();
  }

  /**
   * 각 관광지의 추가 이미지들을 동기화
   */
  async syncLandmarkImages() {
    return this.tourSyncImageService.sync();
  }

  /**
   * 각 관광지의 소개 정보(영업시간, 휴무일 등)를 동기화
   */
  async syncLandmarkIntros() {
    return this.tourSyncIntroService.sync();
  }

  /**
   * DB에 저장된 모든 관광지 목록 조회
   */
  async getLandmarks() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('landmark').select('*');

    if (error) {
      this.logger.error(`Error fetching landmarks: ${error.message}`);
      throw new Error(error.message);
    }

    return data;
  }
}
