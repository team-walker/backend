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

  /**
   * 매주 월요일 자정에 실행되는 정기 데이터 동기화 작업
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySync() {
    await this.syncAllTourData();
  }

  /**
   * 모든 단계의 관광 데이터를 순차적으로 동기화하는 메인 프로세스
   * (목록 조회 -> 상세 정보 -> 이미지 -> 소개 정보)
   */
  async syncAllTourData() {
    this.logger.log('Starting full tour data synchronization...');
    try {
      const result = await this.tourSyncListService.sync();
      this.logger.log(`Phase 1: List synchronization completed. Processed ${result.count} items.`);

      this.logger.log('Phase 2: Starting detailed tour data synchronization...');
      // 상세 정보 동기화 시, 업데이트 된(또는 새로 추가된) contentId 목록을 반환받음
      const changedContentIds = (await this.tourSyncDetailService.sync()) ?? [];
      this.logger.log(
        `Phase 2: Detailed synchronization completed. (Updated ${changedContentIds.length} items)`,
      );

      this.logger.log('Phase 3: Starting landmark images synchronization...');
      // 변경된 항목들은 강제로 이미지도 다시 동기화
      await this.tourSyncImageService.sync(changedContentIds);
      this.logger.log('Phase 3: Images synchronization completed.');

      this.logger.log('Phase 4: Starting landmark intro synchronization...');
      // 변경된 항목들은 강제로 소개 정보도 다시 동기화
      await this.tourSyncIntroService.sync(changedContentIds);
      this.logger.log('Phase 4: Intro synchronization completed.');

      return { success: true, message: 'Full synchronization completed', count: result.count };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Synchronization failed: ${errorMessage}`);
      throw new Error(`Synchronization failed: ${errorMessage}`);
    }
  }

  /**
   * 한국관광공사 API에서 기본 관광지 목록을 가져와 DB에 저장
   */
  async syncTourData() {
    return this.tourSyncListService.sync();
  }

  /**
   * 각 관광지의 상세 정보(개요, 홈페이지 등)를 동기화
   */
  async syncLandmarkDetails() {
    return this.tourSyncDetailService.sync();
  }

  /**
   * 각 관광지의 추가 이미지들을 동기화
   */
  async syncLandmarkImages() {
    return this.tourSyncImageService.sync();
  }

  /**
   * 각 관광지의 소개 정보(영업시간, 휴무일 등)를 동기화
   */
  async syncLandmarkIntros() {
    return this.tourSyncIntroService.sync();
  }

  /**
   * DB에 저장된 모든 관광지 목록 조회
   */
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

    let { data: mapped, error: mappingError } = await supabase
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
      await this.syncRegionSigunguMap();
      const retry = await supabase
        .from('region_sigungu_map')
        .select('area_code,sigungu_code')
        .eq('sido_name', sidoName)
        .eq('sigungu_name', sigunguName)
        .maybeSingle();

      mapped = retry.data;
      mappingError = retry.error;
    }

    if (mappingError) {
      this.logger.error(`Error reading region_sigungu_map after sync: ${mappingError.message}`);
      throw new InternalServerErrorException('Failed to resolve region code');
    }

    if (!mapped) {
      throw new NotFoundException('No region mapping found for the provided SIDO/SIGUGUN');
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
