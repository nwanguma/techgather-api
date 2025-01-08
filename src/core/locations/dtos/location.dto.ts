import { Expose } from 'class-transformer';

export class LocationDto {
  @Expose()
  city;

  @Expose()
  country;
}
