import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { JobStatus } from '../jobs.constants';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => Profile, (profile) => profile.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  owner: Profile;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  application_url: string;

  @ManyToMany(() => Skill, (skill) => skill.jobs)
  skills: Skill[];

  @Column({ type: 'timestamptz', nullable: true })
  deadline: Date;

  @Column({ type: 'enum', enum: JobStatus, nullable: true })
  status: JobStatus;

  @Column({ nullable: true })
  views: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Comment, (comment) => comment.job)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.job)
  reactions: Reaction[];
}
