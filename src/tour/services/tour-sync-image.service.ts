import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { LandmarkImageEntity } from '../interfaces/landmark-image.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncImageService {
  private readonly logger = new Logger(TourSyncImageService.name);

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Phase 3: 관광지 이미지 동기화
   * @param forceUpdateIds 강제로 업데이트할 contentid 목록 (변경된 정보 등)
   */
  async sync(forceUpdateIds: number[] = []) {
    const supabase = this.supabaseService.getClient();

    // 1. 이미 이미지가 저장된 contentid 목록 조회 (중복 제거)
    const { data: existingImages } = await supabase.from('landmark_image').select('contentid');

    const existingIds = new Set(existingImages?.map((img) => img.contentid) || []);

    // 2. 전체 관광지 contentid 조회
    const { data: landmarks, error } = await supabase.from('landmark').select('contentid');

    if (error || !landmarks) {
      this.logger.error(`Error fetching landmarks for image sync: ${error?.message}`);
      return;
    }

    // 3. 동기화 대상 선정: (이미지가 없는 것) OR (강제 업데이트 대상)
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
      this.logger.log('All landmark images are already up to date.');
      return;
    }

    // 4. Process sequentially
    const BATCH_SIZE = 50;
    let currentBatch: LandmarkImageEntity[] = [];
    let processedCount = 0;
    let landmarkIndex = 0;

    for (const landmark of toSync) {
      landmarkIndex++;
      const isForced = forceUpdateSet.has(landmark.contentid);
      this.logger.log(
        `[${landmarkIndex}/${toSync.length}] Fetching images for contentid: ${landmark.contentid}${isForced ? ' (Forced Update)' : ''}`,
      );

      // 데이터 중복 방지: 강제 업데이트이거나 이미 데이터가 존재할 수 있는 경우 삭제 후 재등록
      if (isForced || existingIds.has(landmark.contentid)) {
        await supabase.from('landmark_image').delete().eq('contentid', landmark.contentid);
      }

      const images = await this.tourApiService.fetchLandmarkImages(landmark.contentid);

      if (images.length > 0) {
        this.logger.log(`Fetched ${images.length} images for contentid: ${landmark.contentid}`);
        // 강제 업데이트인 경우 기존 이미지를 덮어씌우기 위해 upsert 사용
        currentBatch.push(...images);
      } else {
        this.logger.log(`No images found for contentid: ${landmark.contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (currentBatch.length >= BATCH_SIZE) {
        this.logger.log(`Upserting batch of ${currentBatch.length} images...`);
        await this.upsertBatch(currentBatch);
        processedCount += currentBatch.length;
        this.logger.log(`Synced images progress: ${processedCount} images processed`);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      this.logger.log(`Upserting final batch of ${currentBatch.length} images...`);
      await this.upsertBatch(currentBatch);
      processedCount += currentBatch.length;
      this.logger.log(`Synced all images. Total: ${processedCount}`);
    }
  }

  private async upsertBatch(batch: LandmarkImageEntity[]) {
    const supabase = this.supabaseService.getClient();
    // NOTE: 'onConflict' might need adjustment based on table constraints for images
    // Usually images are unique by (contentid, serialnum) or just serialnum if global
    const { error: upsertError } = await supabase.from('landmark_image').upsert(batch);

    if (upsertError) {
      this.logger.error(`Error upserting images: ${upsertError.message}`);
    }
  }
}
