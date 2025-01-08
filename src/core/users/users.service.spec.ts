import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository, QueryRunner, EntityManager } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { UserStatus } from './users.constants';

describe('UsersService', () => {
  let userService: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let profilesRepository: jest.Mocked<Repository<Profile>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunnerMock: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      } as unknown as jest.Mocked<EntityManager>,
    } as unknown as jest.Mocked<QueryRunner>;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    } as unknown as jest.Mocked<DataSource>;

    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    profilesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Profile>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: usersRepository },
        { provide: 'ProfileRepository', useValue: profilesRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should create a user and profile successfully', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    const mockUser = {
      id: 1,
      uuid: 'user-uuid',
      email: dto.email,
      password: 'hashedPassword',
    };

    const mockProfile = {
      id: 1,
      first_name: dto.first_name,
      last_name: dto.last_name,
      user_uuid: mockUser.uuid,
    };

    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(mockUser as any);
    (queryRunnerMock.manager.save as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce({ ...mockUser, profile: mockProfile });

    profilesRepository.create.mockReturnValue(mockProfile as any);

    const result = await userService.createUser(dto);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(usersRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      password: expect.any(String),
      status: UserStatus.ACTIVE,
      last_seen: expect.any(Date),
    });
    expect(profilesRepository.create).toHaveBeenCalledWith({
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      user: mockUser,
      user_uuid: mockUser.uuid,
    });
    expect(queryRunnerMock.manager.save).toHaveBeenCalledTimes(3);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should throw ConflictException if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    usersRepository.findOne.mockResolvedValue({
      id: 1,
      email: dto.email,
    } as any);

    await expect(userService.createUser(dto)).rejects.toThrow(
      ConflictException,
    );

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
  });

  it('should throw BadRequestException on unexpected error', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    usersRepository.findOne.mockResolvedValue(null);

    (queryRunnerMock.manager.save as jest.Mock).mockRejectedValue(
      new Error('Unexpected Error'),
    );

    await expect(userService.createUser(dto)).rejects.toThrow(
      BadRequestException,
    );

    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
  });

  it('should activate a user by updating its status', async () => {
    const userId = 'user-uuid';
    const mockUser = {
      uuid: userId,
      status: UserStatus.INACTIVE,
    } as User;

    usersRepository.findOne.mockResolvedValue(mockUser);
    usersRepository.save.mockResolvedValue({
      ...mockUser,
      status: UserStatus.ACTIVE,
    });

    const result = await userService.activateUser(userId);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { uuid: userId },
    });
    expect(usersRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      status: UserStatus.ACTIVE,
    });
    expect(result.status).toBe(UserStatus.ACTIVE);
  });

  it('should reset a user password by calling changePassword', async () => {
    const mockUser = {
      uuid: 'user-uuid',
      password: 'oldPasswordHash',
    } as User;
    const mockDto = {
      new_password: 'newPassword123',
      old_password: mockUser.password,
    };
    const token = 'reset-token';

    jest.spyOn(userService, 'changePassword').mockResolvedValue(mockUser);

    const result = await userService.resetPassword(mockUser, token, mockDto);

    expect(userService.changePassword).toHaveBeenCalledWith(
      mockUser,
      mockDto.new_password,
    );
    expect(result).toEqual(mockUser);
  });

  it('should update the last seen time of a user', async () => {
    const mockUser = {
      uuid: 'user-uuid',
      last_seen: null,
    } as User;

    const updatedUser = {
      ...mockUser,
      last_seen: new Date(),
    };

    usersRepository.save.mockResolvedValue(updatedUser);

    await userService.updateLastSeen(mockUser);

    expect(usersRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      last_seen: expect.any(Date),
    });
  });
});
