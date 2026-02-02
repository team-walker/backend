import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [TourController],
  providers: [TourService],
})
export class TourModule {}
