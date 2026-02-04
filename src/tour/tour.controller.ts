import { Controller, Get, Post } from '@nestjs/common';

import { TourService } from './tour.service';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post('sync')
  async syncTourData() {
    return this.tourService.syncAllTourData();
  }

  @Post('sync/list')
  async syncTourList() {
    return this.tourService.syncTourData();
  }

  @Post('sync/detail')
  async syncTourDetail() {
    await this.tourService.syncLandmarkDetails();
    return {
      success: true,
      message: 'Landmark details synchronization completed',
    };
  }

  @Post('sync/image')
  async syncTourImage() {
    await this.tourService.syncLandmarkImages();
    return {
      success: true,
      message: 'Landmark images synchronization completed',
    };
  }

  @Post('sync/intro')
  async syncTourIntro() {
    await this.tourService.syncLandmarkIntros();
    return {
      success: true,
      message: 'Landmark intro synchronization completed',
    };
  }

  @Get()
  async getTourData() {
    return this.tourService.getLandmarks();
  }
}
