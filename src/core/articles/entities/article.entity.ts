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

import { Reaction } from '../../reactions/entities/reaction.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar' })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  banner: string;

  @Column()
  views: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Profile, (profile) => profile.articles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profile_id' })
  owner: Profile;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.article)
  reactions: Reaction[];
}
