import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { LandmarkIntroEntity } from '../interfaces/landmark-intro.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncIntroService {
  private readonly logger = new Logger(TourSyncIntroService.name);

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Phase 4: 관광지 소개 정보 동기화
   * @param forceUpdateIds 강제로 업데이트할 contentid 목록 (변경된 정보 등)
   */
  async sync(forceUpdateIds: number[] = []) {
    const supabase = this.supabaseService.getClient();

    // 1. 이미 소개 정보가 있는 contentid 목록 조회
    const { data: existingIntros } = await supabase.from('landmark_intro').select('contentid');
    const existingIds = new Set(existingIntros?.map((i) => i.contentid) || []);

    // 2. 전체 관광지 contentid 조회
    const { data: landmarks, error } = await supabase.from('landmark').select('contentid');

    if (error || !landmarks) {
      this.logger.error(`Error fetching landmarks for intro sync: ${error?.message}`);
      return;
    }

    // 3. 동기화 대상 선정: (소개 정보가 없는 것) OR (강제 업데이트 대상)
    const forceUpdateSet = new Set(forceUpdateIds);
    const toSync = landmarks.filter(
      (l) => !existingIds.has(l.contentid) || forceUpdateSet.has(l.contentid),
    );

    const missingCount = toSync.filter((l) => !existingIds.has(l.contentid)).length;
    const forceCount = toSync.filter(
      (l) => forceUpdateSet.has(l.contentid) && existingIds.has(l.contentid),
    ).length;

    this.logger.log(`Found ${landmarks.length} total landmarks.`);
    this.logger.log(
      `Sync targets: ${toSync.length} (Missing: ${missingCount}, Forced by update: ${forceCount})`,
    );

    if (toSync.length === 0) {
      this.logger.log('All landmark intros are already up to date.');
      return;
    }

    // 4. 필터링된 대상만 순차적 프로세스 진행
    const BATCH_SIZE = 50;
    let currentBatch: LandmarkIntroEntity[] = [];
    let processedCount = 0;
    let landmarkIndex = 0;

    for (const landmark of toSync) {
      landmarkIndex++;
      const isForced = forceUpdateSet.has(landmark.contentid);
      this.logger.log(
        `[${landmarkIndex}/${toSync.length}] Fetching intro for contentid: ${
          landmark.contentid
        }${isForced ? ' (Forced Update)' : ''}`,
      );

      const intro = await this.tourApiService.fetchLandmarkIntro(landmark.contentid);

      if (intro) {
        currentBatch.push(intro);
      } else {
        this.logger.log(`No intro found for contentid: ${landmark.contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (currentBatch.length >= BATCH_SIZE) {
        this.logger.log(`Upserting batch of ${currentBatch.length} intros...`);
        await this.upsertBatch(currentBatch);
        processedCount += currentBatch.length;
        this.logger.log(`Synced intros progress: ${processedCount}/${toSync.length}`);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      this.logger.log(`Upserting final batch of ${currentBatch.length} intros...`);
      await this.upsertBatch(currentBatch);
      processedCount += currentBatch.length;
      this.logger.log(`Synced all intros. Total: ${processedCount}`);
    }
  }

  private async upsertBatch(batch: LandmarkIntroEntity[]) {
    const supabase = this.supabaseService.getClient();
    const { error: upsertError } = await supabase
      .from('landmark_intro')
      .upsert(batch, { onConflict: 'contentid' });

    if (upsertError) {
      this.logger.error(`Error upserting intros: ${upsertError.message}`);
    }
  }
}
