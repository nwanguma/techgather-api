import { DataSource, QueryRunner } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import { User } from './core/users/entities/user.entity';
import { Profile } from './core/profiles/entities/profile.entity';
import { Reaction } from './core/reactions/entities/reaction.entity';
import { Comment } from './core/comments/entities/comment.entity';
import { UserStatus } from './core/users/users.constants';
import { ReactionType } from './core/reactions/reaction.constants';
import { Location } from './core/locations/entities/location.entity';
import { Skill } from './core/skills/entities/skill.entity';
import { AppDataSource } from 'data-source';
import { SkillType } from './core/skills/skills.constants';
import { Article } from './core/articles/entities/article.entity';
import { Event } from './core/events/entities/event.entity';
import { EventTypes } from './core/events/events.constants';

const softwareSkills = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Ruby',
  'Go',
  'Kotlin',
  'Swift',
  'PHP',
  'SQL',
  'NoSQL',
  'HTML',
  'CSS',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Django',
  'Spring Boot',
  'Flask',
  'Ruby on Rails',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Machine Learning',
  'Data Analysis',
  'Cybersecurity',
  'CI/CD',
  'Agile Methodologies',
];

function generateUniqueSkills(count: number): any[] {
  const shuffledSkills = faker.helpers.shuffle(softwareSkills);
  return shuffledSkills.slice(0, count);
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

async function seedDatabase() {
  const dataSource: DataSource = await AppDataSource.initialize();
  const queryRunner: QueryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const users: User[] = [];
    const profiles: Profile[] = [];

    for (let i = 0; i < 10; i++) {
      const user = new User();
      user.email = faker.internet.email();
      user.password = await hashPassword(faker.internet.password());
      user.status = UserStatus.ACTIVE;

      users.push(user);
      await queryRunner.manager.save(user);

      const profile = new Profile();
      profile.user = user;
      profile.user_uuid = user.uuid;
      profile.first_name = faker.person.firstName();
      profile.last_name = faker.person.lastName();
      profile.email = user.email;
      profile.avatar = faker.image.avatar();
      profile.bio = faker.lorem.paragraph();
      profile.title = faker.person.jobTitle();
      profile.location = faker.location.city();
      profile.github = faker.internet.url();
      profile.website = faker.internet.url();
      profile.updated_at = new Date();
      profile.skills = generateUniqueSkills(5);

      profiles.push(profile);
      await queryRunner.manager.save(profile);
    }

    const articles: Article[] = [];
    const events: Event[] = [];
    const reactions: Reaction[] = [];
    const comments: Comment[] = [];

    for (let i = 0; i < 5; i++) {
      const ownerProfile =
        profiles[Math.floor(Math.random() * profiles.length)];

      const article = new Article();
      article.title = faker.commerce.productName();
      article.body = faker.lorem.paragraphs(2);
      article.banner = faker.image.urlLoremFlickr({ category: 'tech' });
      article.views = 0;
      article.owner = ownerProfile;

      articles.push(article);
      await queryRunner.manager.save(article);

      for (let j = 0; j < 3; j++) {
        const reaction = new Reaction();
        reaction.owner = profiles[Math.floor(Math.random() * profiles.length)];
        reaction.article = article;
        reaction.type = ReactionType.LIKE;

        reactions.push(reaction);
        await queryRunner.manager.save(reaction);
      }

      for (let j = 0; j < 3; j++) {
        const comment = new Comment();
        comment.text = faker.lorem.sentence();
        comment.owner = profiles[Math.floor(Math.random() * profiles.length)];
        comment.article = article;

        comments.push(comment);
        await queryRunner.manager.save(comment);
      }

      const locations: Location[] = Array.from({ length: 100 }, () => {
        const location = new Location();
        location.city = faker.location.city();
        location.country = faker.location.country();

        return location;
      });

      await queryRunner.manager.save(locations);

      const skills: Skill[] = softwareSkills.map((title) => {
        const skill = new Skill();
        skill.title = title;
        skill.type = SkillType.PROFILE;

        return skill;
      });

      await queryRunner.manager.save(skills);
    }

    for (let i = 0; i < 5; i++) {
      const ownerProfile =
        profiles[Math.floor(Math.random() * profiles.length)];

      const event = new Event();
      event.title = faker.commerce.productName();
      event.description = faker.lorem.paragraphs(2);
      event.owner = ownerProfile;
      event.location = faker.location.city();
      event.website = faker.internet.url();
      event.banner = faker.image.urlLoremFlickr({ category: 'tech' });
      event.event_start_date = faker.date.soon({ days: 10 });
      event.event_end_date = faker.date.soon({ days: 20 });
      event.ticket_link = faker.internet.url();
      event.type = EventTypes.HYBRID;
      event.views = 0;

      events.push(event);
      await queryRunner.manager.save(event);

      for (let j = 0; j < 3; j++) {
        const reaction = new Reaction();
        reaction.owner = profiles[Math.floor(Math.random() * profiles.length)];
        reaction.event = event;
        reaction.type = ReactionType.LIKE;

        reactions.push(reaction);
        await queryRunner.manager.save(reaction);
      }

      for (let j = 0; j < 3; j++) {
        const comment = new Comment();
        comment.text = faker.lorem.sentence();
        comment.owner = profiles[Math.floor(Math.random() * profiles.length)];
        comment.event = event;

        comments.push(comment);
        await queryRunner.manager.save(comment);
      }

      const locations: Location[] = Array.from({ length: 100 }, () => {
        const location = new Location();
        location.city = faker.location.city();
        location.country = faker.location.country();

        return location;
      });

      await queryRunner.manager.save(locations);

      const skills: Skill[] = softwareSkills.map((title) => {
        const skill = new Skill();
        skill.title = title;
        skill.type = SkillType.PROFILE;

        return skill;
      });

      await queryRunner.manager.save(skills);
    }

    await queryRunner.commitTransaction();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seedDatabase();
