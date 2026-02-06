import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { getErrorMessage, logErrorWithContext } from '../../utils/error.util';
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

  async syncLandmarkList(): Promise<SyncTourDataResponseDto> {
    try {
      this.logger.log('Fetching tour data from external API...');

      const records: LandmarkEntity[] = await this.tourApiService.fetchLandmarkList();

      if (!records || records.length === 0) {
        this.logger.error('No items found or invalid structure');
        return { success: false, message: 'No items found' };
      }

      this.logger.log(`Fetched ${records.length} items from API. Checking for updates...`);

      const supabase = this.supabaseService.getClient();

      const { data: existingData, error: fetchError } = await supabase
        .from('landmark')
        .select('contentid, modifiedtime');

      if (fetchError) {
        logErrorWithContext(this.logger, 'Error fetching existing landmarks', fetchError);
      }

      const existingMap = new Map(
        existingData?.map((item) => [item.contentid, item.modifiedtime]) || [],
      );

      const toUpdate = records.filter((record) => {
        const existingModifiedTime = existingMap.get(record.contentid);

        if (!existingModifiedTime) return true;

        if (!record.modifiedtime) return false;

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
        logErrorWithContext(this.logger, 'Supabase error during upsert', error);
        throw new Error(getErrorMessage(error));
      }

      this.logger.log(`Data successfully synced! (${toUpdate.length} items updated)`);

      return { success: true, count: toUpdate.length };
    } catch (error) {
      logErrorWithContext(this.logger, 'Error syncing tour data', error);
      throw new Error(getErrorMessage(error));
    }
  }
}
