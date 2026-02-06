import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { getErrorMessage, logErrorWithContext } from '../../utils/error.util';
import { LandmarkIntroEntity } from '../interfaces/landmark-intro.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncIntroService {
  private readonly logger = new Logger(TourSyncIntroService.name);
  private readonly BATCH_SIZE = 50;
  private readonly API_DELAY = 200;

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async syncLandmarkIntros(forceUpdateIds?: number[]) {
    if (Array.isArray(forceUpdateIds)) {
      if (forceUpdateIds.length === 0) {
        this.logger.log('No specific items to sync intros for. Skipping.');
        return;
      }

      this.logger.log(
        `Syncing intros for ${forceUpdateIds.length} provided items (Forced update)...`,
      );
      await this.processBatch(forceUpdateIds, true);
      return;
    }

    const supabase = this.supabaseService.getClient();

    const { data: existingIntros } = await supabase.from('landmark_intro').select('contentid');
    const existingIds = new Set(existingIntros?.map((i) => i.contentid) || []);

    const { data: landmarks, error } = await supabase.from('landmark').select('contentid');

    if (error || !landmarks) {
      logErrorWithContext(this.logger, 'Error fetching landmarks for intro sync', error);
      throw new Error(getErrorMessage(error));
    }

    const toSync = landmarks.filter((l) => !existingIds.has(l.contentid)).map((l) => l.contentid);

    this.logger.log(`Found ${landmarks.length} total landmarks.`);
    this.logger.log(`Sync targets: ${toSync.length} (Missing intros)`);

    if (toSync.length === 0) {
      this.logger.log('All landmark intros are already up to date.');
      return;
    }

    await this.processBatch(toSync, false);
  }

  private async processBatch(ids: number[], isForced: boolean) {
    let currentBatch: LandmarkIntroEntity[] = [];
    let processedCount = 0;

    for (const [index, contentid] of ids.entries()) {
      this.logger.log(
        `[${index + 1}/${ids.length}] Fetching intro for contentid: ${
          contentid
        }${isForced ? ' (Forced Update)' : ''}`,
      );

      const intro = await this.tourApiService.fetchLandmarkIntro(contentid);

      if (intro) {
        currentBatch.push(intro);
      } else {
        this.logger.log(`No intro found for contentid: ${contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, this.API_DELAY));

      if (currentBatch.length >= this.BATCH_SIZE) {
        this.logger.log(`Upserting batch of ${currentBatch.length} intros...`);
        await this.upsertBatch(currentBatch);
        processedCount += currentBatch.length;
        this.logger.log(`Synced intros progress: ${processedCount}/${ids.length}`);
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
      logErrorWithContext(this.logger, 'Error upserting intros', upsertError);
      throw new Error(getErrorMessage(upsertError));
    }
  }
}
