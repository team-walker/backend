import { Controller, Get, Post } from '@nestjs/common';

import { TourService } from './tour.service';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post('sync')
  async syncTourData() {
    return this.tourService.syncTourData();
  }

  @Get()
  getTourData() {
    return 'Tour data endpoint ready. Use POST /tour/sync to sync data.';
  }
}
