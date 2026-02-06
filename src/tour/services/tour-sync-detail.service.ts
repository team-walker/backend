import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { getErrorMessage, logErrorWithContext } from '../../utils/error.util';
import { LandmarkDetailEntity } from '../interfaces/landmark.interface';
import { TourApiService } from '../tour-api.service';

@Injectable()
export class TourSyncDetailService {
  private readonly logger = new Logger(TourSyncDetailService.name);
  private readonly BATCH_SIZE = 10;
  private readonly API_DELAY = 200;

  constructor(
    private readonly tourApiService: TourApiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async syncLandmarkDetails() {
    const supabase = this.supabaseService.getClient();

    const { data: allLandmarks, error: listError } = await supabase
      .from('landmark')
      .select('contentid, modifiedtime');

    const { data: allDetails, error: detailError } = await supabase
      .from('landmark_detail')
      .select('contentid, modifiedtime');

    if (listError || detailError) {
      logErrorWithContext(
        this.logger,
        'Error fetching data for change detection',
        listError || detailError,
      );
      throw new Error(getErrorMessage(listError || detailError));
    }

    const detailMap = new Map(allDetails?.map((d) => [d.contentid, d.modifiedtime]) || []);

    const toSync = allLandmarks.filter((l) => {
      const detailModifiedTime = detailMap.get(l.contentid);

      if (!detailModifiedTime) {
        return true;
      }

      if (!l.modifiedtime) return false;

      const isChanged = new Date(l.modifiedtime) > new Date(detailModifiedTime);
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

    let currentBatch: LandmarkDetailEntity[] = [];
    let processedCount = 0;
    const processedIds: number[] = [];

    for (const [index, landmark] of toSync.entries()) {
      this.logger.log(
        `[${index + 1}/${toSync.length}] Fetching detail for contentid: ${landmark.contentid}`,
      );

      const detailRecord = await this.tourApiService.fetchLandmarkDetail(landmark.contentid);

      if (detailRecord) {
        currentBatch.push(detailRecord);
        processedIds.push(landmark.contentid);
      } else {
        this.logger.warn(`No details found for contentid: ${landmark.contentid}`);
      }

      await new Promise((resolve) => setTimeout(resolve, this.API_DELAY));

      if (currentBatch.length >= this.BATCH_SIZE) {
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
    const supabase = this.supabaseService.getClient();
    const { error: upsertError } = await supabase
      .from('landmark_detail')
      .upsert(batch, { onConflict: 'contentid' });

    if (upsertError) {
      logErrorWithContext(this.logger, 'Error upserting details', upsertError);
      throw new Error(getErrorMessage(upsertError));
    }
  }
}
