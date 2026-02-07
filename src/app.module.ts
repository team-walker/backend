import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    TourModule,
    AuthModule,
    BookmarkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
