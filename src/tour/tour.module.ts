import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';
import { TourSyncDetailService } from './services/tour-sync-detail.service';
import { TourSyncImageService } from './services/tour-sync-image.service';
import { TourSyncIntroService } from './services/tour-sync-intro.service';
import { TourSyncListService } from './services/tour-sync-list.service';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TourApiService } from './tour-api.service';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [TourController],
  providers: [
    TourService,
    TourApiService,
    TourSyncListService,
    TourSyncDetailService,
    TourSyncImageService,
    TourSyncIntroService,
  ],
})
export class TourModule {}
