import { LocationsService } from './locations.service';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { LocationDto } from './dtos/location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(LocationDto))
  async getCurrentUser() {
    return await this.locationsService.listAllLocations();
  }
}
