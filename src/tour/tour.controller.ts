import { Controller, Get, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { SyncTourDetailResponseDto, SyncTourResponseDto } from './dto/sync-tour-response.dto';
import { TourService } from './tour.service';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post('sync')
  async syncAllLandmarks() {
    return this.tourService.syncAllLandmarkData();
  }

  @Post('sync/list')
  async syncLandmarkList() {
    return this.tourService.syncLandmarkList();
  }

  @Post('sync/detail')
  @ApiResponse({ type: SyncTourDetailResponseDto })
  async syncLandmarkDetail(): Promise<SyncTourDetailResponseDto> {
    const updatedIds = await this.tourService.syncLandmarkDetails();
    return {
      success: true,
      message: 'Landmark details synchronization completed',
      updatedCount: updatedIds?.length ?? 0,
      updatedIds,
    };
  }

  @Post('sync/image')
  @ApiResponse({ type: SyncTourResponseDto })
  async syncLandmarkImage(): Promise<SyncTourResponseDto> {
    await this.tourService.syncLandmarkImages();
    return {
      success: true,
      message: 'Landmark images synchronization completed',
    };
  }

  @Post('sync/intro')
  @ApiResponse({ type: SyncTourResponseDto })
  async syncLandmarkIntro(): Promise<SyncTourResponseDto> {
    await this.tourService.syncLandmarkIntros();
    return {
      success: true,
      message: 'Landmark intro synchronization completed',
    };
  }

  @Get()
  async getLandmarks() {
    return this.tourService.getLandmarks();
  }
}
