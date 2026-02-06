import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SupabaseService } from '../supabase/supabase.service';
import { getErrorMessage, logErrorWithContext } from '../utils/error.util';
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

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySync() {
    await this.syncAllLandmarkData();
  }

  async syncAllLandmarkData() {
    this.logger.log('Starting full tour data synchronization...');
    try {
      const result = await this.tourSyncListService.syncLandmarkList();
      this.logger.log(`Phase 1: List synchronization completed. Processed ${result.count} items.`);

      this.logger.log('Phase 2: Starting detailed tour data synchronization...');
      const changedContentIds = await this.tourSyncDetailService.syncLandmarkDetails();
      this.logger.log(
        `Phase 2: Detailed synchronization completed. (Updated ${changedContentIds.length} items)`,
      );

      this.logger.log('Phase 3: Starting landmark images synchronization...');
      await this.tourSyncImageService.syncLandmarkImages(changedContentIds);
      this.logger.log('Phase 3: Images synchronization completed.');

      this.logger.log('Phase 4: Starting landmark intro synchronization...');
      await this.tourSyncIntroService.syncLandmarkIntros(changedContentIds);
      this.logger.log('Phase 4: Intro synchronization completed.');

      return { success: true, message: 'Full synchronization completed', count: result.count };
    } catch (error) {
      logErrorWithContext(this.logger, 'Full synchronization failed', error);
      throw new Error(`Synchronization failed: ${getErrorMessage(error)}`);
    }
  }

  async syncLandmarkList() {
    return this.tourSyncListService.syncLandmarkList();
  }

  async syncLandmarkDetails() {
    return this.tourSyncDetailService.syncLandmarkDetails();
  }

  async syncLandmarkImages() {
    return this.tourSyncImageService.syncLandmarkImages();
  }

  async syncLandmarkIntros() {
    return this.tourSyncIntroService.syncLandmarkIntros();
  }

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
