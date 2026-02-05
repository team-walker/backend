import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { extractErrorMessage, logError } from '../../utils/error.util';
import { LandmarkImageEntity } from '../interfaces/landmark-image.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncImageService {
  private readonly logger = new Logger(TourSyncImageService.name);
  private readonly BATCH_SIZE = 50;
  private readonly API_DELAY = 200;

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Phase 3: 관광지 이미지 동기화
   * @param forceUpdateIds 강제로 업데이트할 contentid 목록 (변경된 정보 등).
   *                       제공되지 않을 경우(undefined), DB의 누락된 이미지를 전체 스캔하여 동기화합니다.
   *                       빈 배열([])이 제공될 경우, 동기화를 수행하지 않습니다.
   */
  async sync(forceUpdateIds?: number[]) {
    // 1. 특정 업데이트 대상이 명시된 경우 (빈 배열 포함)
    if (Array.isArray(forceUpdateIds)) {
      if (forceUpdateIds.length === 0) {
        this.logger.log('No specific items to sync images for. Skipping.');
        return;
      }

      this.logger.log(
        `Syncing images for ${forceUpdateIds.length} provided items (Forced update)...`,
      );
      await this.processBatch(forceUpdateIds, true);
      return;
    }

    // 2. 명시된 대상이 없는 경우: 전체 스캔 (기존 로직)
    const supabase = this.supabaseService.getClient();

    // 1. 이미 이미지가 저장된 contentid 목록 조회 (중복 제거)
    const { data: existingImages } = await supabase.from('landmark_image').select('contentid');

    const existingIds = new Set(existingImages?.map((img) => img.contentid) || []);

    // 2. 전체 관광지 contentid 조회
    const { data: landmarks, error } = await supabase.from('landmark').select('contentid');

    if (error || !landmarks) {
      logError(this.logger, 'Error fetching landmarks for image sync', error);
      throw new Error(extractErrorMessage(error));
    }

    // 3. 동기화 대상 선정: (이미지가 없는 것) OR (강제 업데이트 대상)
    const toSync = landmarks.filter((l) => !existingIds.has(l.contentid)).map((l) => l.contentid);

    this.logger.log(`Found ${landmarks.length} total landmarks.`);
    this.logger.log(`Sync targets: ${toSync.length} (Missing images)`);

    if (toSync.length === 0) {
      this.logger.log('All landmark images are already up to date.');
      return;
    }

    await this.processBatch(toSync, false);
  }

  private async processBatch(ids: number[], isForced: boolean) {
    let currentBatch: LandmarkImageEntity[] = [];
    let processedCount = 0;

    for (const [index, contentid] of ids.entries()) {
      this.logger.log(
        `[${index + 1}/${ids.length}] Fetching images for contentid: ${contentid}${
          isForced ? ' (Forced Update)' : ''
        }`,
      );

      const images = await this.tourApiService.fetchLandmarkImages(contentid);

      if (images.length > 0) {
        this.logger.log(`Fetched ${images.length} images for contentid: ${contentid}`);
        // 강제 업데이트인 경우 기존 이미지를 덮어씌우기 위해 upsert 사용
        currentBatch.push(...images);
      } else {
        this.logger.log(`No images found for contentid: ${contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, this.API_DELAY));

      if (currentBatch.length >= this.BATCH_SIZE) {
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
    const { error: upsertError } = await supabase
      .from('landmark_image')
      .upsert(batch, { onConflict: 'contentid,serialnum' });

    if (upsertError) {
      logError(this.logger, 'Error upserting images', upsertError);
      throw new Error(extractErrorMessage(upsertError));
    }
  }
}
