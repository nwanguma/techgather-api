import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
} from 'typeorm';

import { IsNotEmpty, IsDate } from 'class-validator';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { EventTypes } from '../events.constants';
import { Feedback } from '../../feedback/entities/feedback.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 2000 })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  banner: string;

  @Column({ type: 'boolean', nullable: true })
  requires_feedback: boolean;

  @Column({ type: 'varchar', nullable: true })
  feedback_guide: string;

  @Column({ type: 'varchar', nullable: true })
  ticket_link: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  link: string;

  @Column({ enum: EventTypes, default: EventTypes.ONSITE, nullable: true })
  type: EventTypes;

  @Column()
  views: number;

  @Column({ type: 'timestamptz' })
  @IsDate()
  @IsNotEmpty()
  event_start_date: Date;

  @Column({ type: 'timestamptz' })
  @IsDate()
  @IsNotEmpty()
  event_end_date: Date;

  @Column({ type: 'varchar', nullable: true })
  attachment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Profile, (profile) => profile.events, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profile_id' })
  owner: Profile;

  @OneToMany(() => Feedback, (feedback) => feedback.event)
  feedbacks: Feedback[];

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.event)
  reactions: Reaction[];
}
