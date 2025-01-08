import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

import { UserStatus } from './users.constants';
import { ChangePasswordDto } from '../auth/dtos/change-password.dto';
// import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findUserWithProfileByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: [
        'profile',
        'profile.following',
        'profile.following.user',
        'profile.followers.user',
        'profile.skills',
      ],
    });

    return user;
  }

  async getUserById(id: string) {
    return await this.usersRepository.findOne({
      where: { uuid: id },
      relations: [
        'profile',
        'profile.following',
        'profile.following.user',
        'profile.followers.user',
        'profile.skills',
      ],
    });
  }

  async getUserWithProfileById(id: string) {
    return await this.usersRepository.findOne({
      where: { uuid: id },
      relations: [
        'profile',
        'profile.following',
        'profile.following.user',
        'profile.followers.user',
        'profile.skills',
      ],
    });
  }

  async createUser(dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { first_name, last_name, ...rest } = dto;
      const existingUser = await this.usersRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) throw new ConflictException('Email already exists');

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const userInstance = this.usersRepository.create({
        ...rest,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        last_seen: new Date(),
      });
      const savedUser = await queryRunner.manager.save(userInstance);

      const profileData = {
        first_name,
        last_name,
        email: dto.email,
        user: savedUser,
        user_uuid: savedUser.uuid,
      };
      const profile = this.profilesRepository.create(profileData);
      const savedProfile = await queryRunner.manager.save(profile);

      savedUser.profile = savedProfile;
      await queryRunner.manager.save(savedUser);

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(error);

      if (error.status === 409) throw error;

      throw new BadRequestException('Something went wrong. Please try again.');
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async activateUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { uuid: userId },
    });

    user.status = UserStatus.ACTIVE;

    return await this.usersRepository.save(user);
  }

  async resetPassword(
    user: User,
    token: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    return await this.changePassword(user, changePasswordDto.new_password);
  }

  async changePassword(user: User, newPassword: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    return await this.usersRepository.save(user);
  }

  async updateLastSeen(user: User) {
    user.last_seen = new Date();

    await this.usersRepository.save(user);
  }
}
