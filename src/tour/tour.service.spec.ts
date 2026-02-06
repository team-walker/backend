import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgrestError } from '@supabase/supabase-js';

import { SupabaseService } from '../supabase/supabase.service';
import { TourSyncDetailService } from './services/tour-sync-detail.service';
import { TourSyncImageService } from './services/tour-sync-image.service';
import { TourSyncIntroService } from './services/tour-sync-intro.service';
import { TourSyncListService } from './services/tour-sync-list.service';
import { TourService } from './tour.service';
import { TourApiService } from './tour-api.service';

type SupabaseResult<T = unknown> = { data: T | null; error: PostgrestError | null };

function createSupabaseMock(
  results: Record<string, { order?: SupabaseResult; maybeSingle?: SupabaseResult }>,
) {
  return {
    from: jest.fn((table: string) => {
      interface SupabaseQueryBuilder {
        select: jest.Mock<SupabaseQueryBuilder, unknown[]>;
        eq: jest.Mock<SupabaseQueryBuilder, unknown[]>;
        order: jest.Mock<Promise<SupabaseResult>, unknown[]>;
        maybeSingle: jest.Mock<Promise<SupabaseResult>, unknown[]>;
      }

      const builder: SupabaseQueryBuilder = {
        select: jest.fn(() => builder),
        eq: jest.fn(() => builder),
        order: jest.fn(() => Promise.resolve(results[table]?.order ?? { data: null, error: null })),
        maybeSingle: jest.fn(() =>
          Promise.resolve(results[table]?.maybeSingle ?? { data: null, error: null }),
        ),
      };
      return builder;
    }),
  };
}

describe('TourService', () => {
  let service: TourService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        { provide: SupabaseService, useValue: { getClient: jest.fn() } },
        { provide: TourApiService, useValue: { fetchSigunguCodes: jest.fn() } },
        { provide: TourSyncListService, useValue: { sync: jest.fn() } },
        { provide: TourSyncDetailService, useValue: { sync: jest.fn() } },
        { provide: TourSyncImageService, useValue: { sync: jest.fn() } },
        { provide: TourSyncIntroService, useValue: { sync: jest.fn() } },
      ],
    }).compile();

    service = module.get<TourService>(TourService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  describe('getLandmarksByRegionNames', () => {
    it('returns landmarks when mapping exists', async () => {
      const supabase = createSupabaseMock({
        region_sigungu_map: {
          maybeSingle: { data: { area_code: 1, sigungu_code: 2 }, error: null },
        },
        landmark: {
          order: { data: [{ contentid: 1 }, { contentid: 2 }], error: null },
        },
      });
      (supabaseService.getClient as jest.Mock).mockReturnValue(supabase);

      const result = await service.getLandmarksByRegionNames('서울특별시', '중구');

      expect(result).toHaveLength(2);
      expect(supabase.from).toHaveBeenCalledWith('region_sigungu_map');
      expect(supabase.from).toHaveBeenCalledWith('landmark');
    });

    it('throws BadRequest when missing params', async () => {
      await expect(service.getLandmarksByRegionNames('', '중구')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(service.getLandmarksByRegionNames('서울특별시', '')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('getLandmarkDetail', () => {
    it('returns detail + images + intro', async () => {
      const supabase = createSupabaseMock({
        landmark_detail: {
          maybeSingle: { data: { contentid: 100, title: 'A' }, error: null },
        },
        landmark_image: {
          order: { data: [{ id: 1 }, { id: 2 }], error: null },
        },
        landmark_intro: {
          maybeSingle: { data: { contentid: 100, contenttypeid: 12 }, error: null },
        },
      });
      (supabaseService.getClient as jest.Mock).mockReturnValue(supabase);

      const result = await service.getLandmarkDetail(100);

      expect(result.detail.contentid).toBe(100);
      expect(result.images).toHaveLength(2);
      expect(result.intro?.contentid).toBe(100);
    });

    it('throws NotFound when detail missing', async () => {
      const supabase = createSupabaseMock({
        landmark_detail: {
          maybeSingle: { data: null, error: null },
        },
      });
      (supabaseService.getClient as jest.Mock).mockReturnValue(supabase);

      await expect(service.getLandmarkDetail(999)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws InternalServerError when images query fails', async () => {
      const supabase = createSupabaseMock({
        landmark_detail: {
          maybeSingle: { data: { contentid: 100 }, error: null },
        },
        landmark_image: {
          order: {
            data: null,
            error: { message: 'boom', details: '', hint: '', code: '' } as PostgrestError,
          },
        },
        landmark_intro: {
          maybeSingle: { data: null, error: null },
        },
      });
      (supabaseService.getClient as jest.Mock).mockReturnValue(supabase);

      await expect(service.getLandmarkDetail(100)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
