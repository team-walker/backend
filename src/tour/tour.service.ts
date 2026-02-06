import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../database.types';
import { SupabaseService } from '../supabase/supabase.service';
import { TourSyncDetailService } from './services/tour-sync-detail.service';
import { TourSyncImageService } from './services/tour-sync-image.service';
import { TourSyncIntroService } from './services/tour-sync-intro.service';
import { TourSyncListService } from './services/tour-sync-list.service';
import { TourApiService } from './tour-api.service';

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly tourApiService: TourApiService,
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
      const result = await this.syncLandmarkList();
      this.logger.log(`Phase 1: List synchronization completed. Processed ${result.count} items.`);

      this.logger.log('Phase 2: Starting detailed tour data synchronization...');
      const changedContentIds = (await this.syncLandmarkDetails()) ?? [];
      this.logger.log(
        `Phase 2: Detailed synchronization completed. (Updated ${changedContentIds.length} items)`,
      );

      this.logger.log('Phase 3: Starting landmark images synchronization...');
      await this.syncLandmarkImages(changedContentIds);
      this.logger.log('Phase 3: Images synchronization completed.');

      this.logger.log('Phase 4: Starting landmark intro synchronization...');
      await this.syncLandmarkIntros(changedContentIds);
      this.logger.log('Phase 4: Intro synchronization completed.');

      return { success: true, message: 'Full synchronization completed', count: result.count };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Synchronization failed: ${errorMessage}`);
      throw new Error(`Synchronization failed: ${errorMessage}`);
    }
  }

  async syncLandmarkList() {
    return this.tourSyncListService.syncLandmarkList();
  }

  async syncLandmarkDetails() {
    return this.tourSyncDetailService.syncLandmarkDetails();
  }

  async syncLandmarkImages(forceUpdateIds?: number[]) {
    return this.tourSyncImageService.syncLandmarkImages(forceUpdateIds);
  }

  async syncLandmarkIntros(forceUpdateIds?: number[]) {
    return this.tourSyncIntroService.syncLandmarkIntros(forceUpdateIds);
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

  async getLandmarkDetail(contentId: number): Promise<{
    detail: Database['public']['Tables']['landmark_detail']['Row'];
    images: Database['public']['Tables']['landmark_image']['Row'][];
    intro: Database['public']['Tables']['landmark_intro']['Row'] | null;
  }> {
    if (!Number.isInteger(contentId) || contentId < 1) {
      throw new BadRequestException('contentId must be a positive integer');
    }

    const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;
    const [detailResult, imagesResult, introResult] = await Promise.all([
      supabase.from('landmark_detail').select('*').eq('contentid', contentId).maybeSingle(),
      supabase.from('landmark_image').select('*').eq('contentid', contentId).order('id'),
      supabase.from('landmark_intro').select('*').eq('contentid', contentId).maybeSingle(),
    ]);

    if (detailResult.error) {
      this.logger.error(`Error fetching landmark detail: ${detailResult.error.message}`);
      throw new InternalServerErrorException('Failed to fetch landmark detail');
    }

    if (!detailResult.data) {
      throw new NotFoundException('Landmark not found');
    }

    if (imagesResult.error) {
      this.logger.error(`Error fetching landmark images: ${imagesResult.error.message}`);
      throw new InternalServerErrorException('Failed to fetch landmark images');
    }

    if (introResult.error) {
      this.logger.error(`Error fetching landmark intro: ${introResult.error.message}`);
      throw new InternalServerErrorException('Failed to fetch landmark intro');
    }

    return {
      detail: detailResult.data,
      images: imagesResult.data ?? [],
      intro: introResult.data ?? null,
    };
  }

  async syncRegionSigunguMap() {
    const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;
    let upsertCount = 0;

    const { data: regions, error: regionsError } = await supabase
      .from('region_sigungu_map')
      .select('area_code,sido_name');

    if (regionsError) {
      this.logger.error(`Error reading region_sigungu_map: ${regionsError.message}`);
      throw new InternalServerErrorException('Failed to read region code map');
    }

    if (!regions || regions.length === 0) {
      throw new BadRequestException('region_sigungu_map is empty; seed area_code/sido_name first');
    }

    const uniqueRegions = new Map<string, number>();
    for (const region of regions) {
      if (!region?.sido_name || !region?.area_code) continue;
      if (!uniqueRegions.has(region.sido_name)) {
        uniqueRegions.set(region.sido_name, region.area_code);
      }
    }

    for (const [sidoName, areaCode] of uniqueRegions.entries()) {
      const sigunguCodes = await this.tourApiService.fetchSigunguCodes(areaCode);

      if (sigunguCodes.length === 0) {
        continue;
      }

      const records = sigunguCodes.map((item: { code: string; name: string }) => ({
        area_code: areaCode,
        sido_name: sidoName,
        sigungu_code: Number.parseInt(item.code, 10),
        sigungu_name: item.name,
      }));

      const { error } = await supabase
        .from('region_sigungu_map')
        .upsert(records, { onConflict: 'area_code,sigungu_code' });

      if (error) {
        this.logger.error(
          `Error syncing region_sigungu_map (areaCode=${areaCode}): ${error.message}`,
        );
        throw new InternalServerErrorException('Failed to sync region code map');
      }

      upsertCount += records.length;
    }

    return { success: true, count: upsertCount };
  }

  async getLandmarksByRegionNames(
    sidoName: string,
    sigunguName: string,
  ): Promise<Database['public']['Tables']['landmark']['Row'][]> {
    if (!sidoName || !sigunguName) {
      throw new BadRequestException('sido and sigugun are required');
    }

    const supabase = this.supabaseService.getClient() as unknown as SupabaseClient<Database>;

    const { data: mapped, error: mappingError } = await supabase
      .from('region_sigungu_map')
      .select('area_code,sigungu_code')
      .eq('sido_name', sidoName)
      .eq('sigungu_name', sigunguName)
      .maybeSingle();

    if (mappingError) {
      this.logger.error(`Error reading region_sigungu_map: ${mappingError.message}`);
      throw new InternalServerErrorException('Failed to resolve region code');
    }

    if (!mapped) {
      throw new NotFoundException(
        'No region mapping found for the provided SIDO/SIGUGUN. Sync runs in background.',
      );
    }

    const { data: landmarks, error } = await supabase
      .from('landmark')
      .select('*')
      .eq('areacode', mapped.area_code)
      .eq('sigungucode', mapped.sigungu_code)
      .order('title', { ascending: true });

    if (error) {
      this.logger.error(`Error fetching landmarks by mapped code: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch landmarks');
    }

    return landmarks ?? [];
  }
}
