import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModule을 전역 모듈로 설정
      envFilePath: '.env', // 기본적으로 .env 파일을 자동으로 찾음
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    TourModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
