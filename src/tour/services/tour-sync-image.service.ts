import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { getErrorMessage, logErrorWithContext } from '../../utils/error.util';
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

  async syncLandmarkImages(forceUpdateIds?: number[]) {
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

    const supabase = this.supabaseService.getClient();

    const { data: existingImages } = await supabase.from('landmark_image').select('contentid');

    const existingIds = new Set(existingImages?.map((img) => img.contentid) || []);

    const { data: landmarks, error } = await supabase.from('landmark').select('contentid');

    if (error || !landmarks) {
      logErrorWithContext(this.logger, 'Error fetching landmarks for image sync', error);
      throw new Error(getErrorMessage(error));
    }

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
      logErrorWithContext(this.logger, 'Error upserting images', upsertError);
      throw new Error(getErrorMessage(upsertError));
    }
  }
}
