import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Job } from '../../jobs/entities/job.entity';
import { SkillType } from '../skills.constants';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @ManyToMany(() => Profile, (profile) => profile.skills, {
    onDelete: 'SET NULL',
  })
  @JoinTable({
    name: 'profiles_skills',
    joinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'profile_id',
      referencedColumnName: 'id',
    },
  })
  profiles: Profile[];

  @ManyToMany(() => Job, (job) => job.skills)
  @JoinTable({
    name: 'jobs_skills',
    joinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'job_id',
      referencedColumnName: 'id',
    },
  })
  jobs: Job[];

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  type: SkillType;
}
