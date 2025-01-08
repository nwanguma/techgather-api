import {
  Entity,
  Check,
  Unique,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { OAuthProvider, UserStatus } from '../users.constants';
import { Notification } from '../../notifications/notifications.entity';

@Entity('users')
@Unique(['email'])
@Check(`"username" IS NULL OR LENGTH("username") >= 3`)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'enum', enum: OAuthProvider, nullable: true })
  provider: OAuthProvider;

  @Column({ type: 'varchar', nullable: true })
  provider_id: string;

  @Column({ type: 'varchar', nullable: true })
  access_token: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  // @OneToMany(() => Message, (message) => message.receiver)
  // received_messages: Message[];

  @Column({ type: 'timestamptz', nullable: true })
  last_seen: Date;
}
