import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Job } from '../../jobs/entities/job.entity';
import { Follower } from '../../followers/entities/follower.entity';
import {
  Language,
  ProfileStatus,
  VisibilityStatus,
} from '../profiles.constants';
import { Comment } from '../../comments/entities/comment.entity';
import { Event } from '../../events/entities/event.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Article } from '../../articles/entities/article.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  user_uuid: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  last_name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  heading: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  linkedin: string;

  @Column({ type: 'varchar', nullable: true })
  github: string;

  @Column({ type: 'varchar', nullable: true })
  resume: string;

  @Column({ type: 'boolean', nullable: true })
  is_mentor: boolean;

  @Column({ type: 'varchar', nullable: true })
  mentor_note: string;

  @Column({ type: 'enum', enum: ProfileStatus, nullable: true })
  status: ProfileStatus;

  @Column({
    type: 'enum',
    enum: Language,
    array: true,
    nullable: true,
  })
  languages: Language[];

  @OneToMany(() => Follower, (follower) => follower.user)
  followers: Follower[];

  @OneToMany(() => Follower, (follower) => follower.follower)
  following: Follower[];

  @Column({ nullable: true })
  views: number;

  @ManyToMany(() => Skill, (skill) => skill.profiles)
  skills: Skill[];

  @OneToMany(() => Job, (job) => job.owner)
  jobs: Job[];

  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PUBLIC,
  })
  visibility_status: VisibilityStatus;

  // Profile that gave the feedback
  @OneToMany(() => Feedback, (feedback) => feedback.owner)
  owned_feedbacks: Feedback[];

  @OneToMany(() => Event, (event) => event.owner)
  events: Event[];

  @OneToMany(() => Article, (article) => article.owner)
  articles: Article[];

  //Comments created by the user on other entities
  @OneToMany(() => Comment, (comment) => comment.owner)
  owned_comments: Comment[];

  //Reactions created by the user on other entities
  @OneToMany(() => Reaction, (reaction) => reaction.owner)
  owned_reactions: Reaction[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
