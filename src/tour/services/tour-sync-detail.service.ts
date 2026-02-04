import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../../database.types';
import { SupabaseService } from '../../supabase/supabase.service';
import { LandmarkDetailEntity } from '../interfaces/landmark.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncDetailService {
  private readonly logger = new Logger(TourSyncDetailService.name);

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Phase 2: 관광지 상세 정보 동기화
   */
  async sync() {
    const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;

    // 1. 기본 정보(landmark)와 상세 정보(landmark_detail)의 수정 시각 비교
    const { data: allLandmarks, error: listError } = await supabase
      .from('landmark')
      .select('contentid, modifiedtime');

    const { data: allDetails, error: detailError } = await supabase
      .from('landmark_detail')
      .select('contentid, modifiedtime');

    if (listError || detailError) {
      this.logger.error('Error fetching data for change detection');
      return;
    }

    const detailMap = new Map(allDetails?.map((d) => [d.contentid, d.modifiedtime]) || []);

    // 대상 필터링: 상세 정보가 없거나, 기본 정보의 수정 시각이 더 최신인 경우
    const toSync = allLandmarks.filter((l) => {
      const detailModifiedTime = detailMap.get(l.contentid);

      // 상세 정보가 원본 테이블(landmark)보다 오래되었거나 없는 경우 업데이트 대상
      if (!detailModifiedTime) {
        // console.log(`[LandmarkDetail] ContentID ${l.contentid}: New item (no existing detail)`);
        return true;
      }

      if (!l.modifiedtime) return false;

      const isChanged = new Date(l.modifiedtime) > new Date(detailModifiedTime);
      if (isChanged) {
        // console.log(`[LandmarkDetail] ContentID ${l.contentid}: Content core was updated (${detailModifiedTime} -> ${l.modifiedtime})`);
      }
      return isChanged;
    });

    this.logger.log(
      `Found ${allLandmarks.length} total landmarks. ${toSync.length} need update based on modifiedtime comparison between landmark and landmark_detail.`,
    );

    if (toSync.length === 0) {
      this.logger.log('All landmark details are already up to date.');
      return [];
    }

    this.logger.log(`Starting detailed sync for ${toSync.length} items...`);

    // 2. 필터링된 대상만 순차적으로 프로세스 진행
    const BATCH_SIZE = 10;
    let currentBatch: LandmarkDetailEntity[] = [];
    let processedCount = 0;
    const processedIds: number[] = [];

    for (const landmark of toSync) {
      this.logger.log(
        `[${processedCount + 1}/${toSync.length}] Fetching detail for contentid: ${landmark.contentid}`,
      );

      const detailRecord = await this.tourApiService.fetchLandmarkDetail(landmark.contentid);

      if (detailRecord) {
        currentBatch.push(detailRecord);
        processedIds.push(landmark.contentid);
      } else {
        this.logger.warn(`No details found for contentid: ${landmark.contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (currentBatch.length >= BATCH_SIZE) {
        this.logger.log(`Upserting batch of ${currentBatch.length} details...`);
        await this.upsertBatch(currentBatch);
        processedCount += currentBatch.length;
        this.logger.log(`Synced details progress: ${processedCount}/${toSync.length}`);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      this.logger.log(`Upserting final batch of ${currentBatch.length} details...`);
      await this.upsertBatch(currentBatch);
      processedCount += currentBatch.length;
      this.logger.log(`Synced all details. Total processed: ${processedCount}`);
    }

    return processedIds;
  }

  private async upsertBatch(batch: LandmarkDetailEntity[]) {
    const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;
    const { error: upsertError } = await supabase
      .from('landmark_detail')
      .upsert(batch, { onConflict: 'contentid' });

    if (upsertError) {
      this.logger.error(`Error upserting details: ${upsertError.message}`);
    }
  }
}
