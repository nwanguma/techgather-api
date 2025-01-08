import { Expose, Type, Transform } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';

export class FollowerFollowingDto {
  @IsArray()
  @Type(() => FollowerDto)
  @Expose()
  followers: FollowerDto[];

  @IsArray()
  @Type(() => FollowingDto)
  @Expose()
  following: FollowingDto[];
}

export class FollowerDto {
  @Transform(({ obj }) => obj.follower?.first_name)
  @IsNotEmpty()
  @Expose()
  first_name: string;

  @Transform(({ obj }) => obj.follower?.last_name)
  @IsNotEmpty()
  @Expose()
  last_name: string;

  @Transform(({ obj }) => obj.follower?.email)
  @IsNotEmpty()
  @Expose()
  email: string;

  @Transform(({ obj }) => obj.follower?.avatar)
  @IsNotEmpty()
  @Expose()
  avatar: string;

  @Transform(({ obj }) => obj.follower?.title)
  @IsNotEmpty()
  @Expose()
  @Expose()
  title: string;

  @Transform(({ obj }) => obj.follower?.uuid)
  @IsNotEmpty()
  @Expose()
  profile_id: string;

  @Transform(({ obj }) => obj.follower?.user_uuid)
  @IsNotEmpty()
  @Expose()
  user_id: string;

  @Expose()
  created_at: string;
}

export class FollowingDto {
  @Transform(({ obj }) => obj.user?.first_name)
  @IsNotEmpty()
  @Expose()
  first_name: string;

  @Transform(({ obj }) => obj.user?.last_name)
  @IsNotEmpty()
  @Expose()
  last_name: string;

  @Transform(({ obj }) => obj.user?.email)
  @IsNotEmpty()
  @Expose()
  email: string;

  @Transform(({ obj }) => obj.user?.avatar)
  @IsNotEmpty()
  @Expose()
  avatar: string;

  @Transform(({ obj }) => obj.user?.title)
  @IsNotEmpty()
  @Expose()
  @Expose()
  title: string;

  @Transform(({ obj }) => obj.user?.uuid)
  @IsNotEmpty()
  @Expose()
  profile_id: string;

  @Transform(({ obj }) => obj.user?.user_uuid)
  @IsNotEmpty()
  @Expose()
  user_id: string;

  @Expose()
  created_at: string;
}
