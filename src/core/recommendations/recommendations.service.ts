import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Article } from '../articles/entities/article.entity';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { JobStatus } from '../jobs/jobs.constants';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async getRecommendations(user: User) {
    const results = await Promise.all([
      this.handleEventRecommendations(user),
      this.handleArticleRecommendations(user),
      this.handleJobRecommendations(user),
    ]);

    return {
      events: results[0].recommendedEvents,
      upcomingEvents: results[0].upcomingEvents,
      liveEvents: results[0].liveEvents,
      articles: results[1],
      jobs: results[2],
    };
  }

  async handleArticleRecommendations(currentUser: User) {
    const { profile: userProfile } = currentUser;

    const articles = await this.articlesRepository.find({
      where: { owner: { uuid: Not(userProfile.uuid) } },
    });

    return (
      articles
        // .filter((article) => new Date(article.article_created_at) >= today)
        .map((article) => {
          const score = 0;

          // const similarArticle = attendedArticles.some(
          //   (attended) =>
          //     attended.title === article.title ||
          //     attended.description.includes(article.description)
          // );
          // if (similarArticle) score += 4;

          //  Mark article as will attend
          // const popularityScore = Math.min(article.attendees?.length || 0, 100) / 10;
          // score += popularityScore;

          return { article, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((result) => result.article)
    );
  }
  async handleEventRecommendations(currentUser: User) {
    const { profile: userProfile } = currentUser;
    const today = new Date();

    const events = await this.eventsRepository.find({
      where: { owner: { uuid: Not(userProfile.uuid) } },
      relations: ['comments', 'reactions'],
    });

    const liveEvents = events.filter(
      (event) => new Date(event.event_end_date) > today,
    );

    const upcomingEvents = events.filter(
      (event) => new Date(event.event_start_date) > today,
    );

    const recommendedEvents = events
      .filter((event) => new Date(event.event_end_date) > today)
      .map((event) => {
        let score = 0;

        const daysUntilEvent =
          (new Date(event.event_start_date).getTime() - today.getTime()) /
          (1000 * 3600 * 24);
        score += Math.max(0, 10 - daysUntilEvent);

        const skillMatches = userProfile.skills.some((skill: Skill) =>
          event.description.includes(skill.title),
        );
        if (skillMatches) score += 5;

        if (event.location === userProfile.location) {
          score += 3;
        } else if (!event.location) {
          score += 2;
        }

        // const similarEvent = attendedEvents.some(
        //   (attended) =>
        //     attended.title === event.title ||
        //     attended.description.includes(event.description)
        // );
        // if (similarEvent) score += 4;

        //  Mark event as will attend
        // const popularityScore = Math.min(event.attendees?.length || 0, 100) / 10;
        // score += popularityScore;

        return { event, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((result) => result.event);

    return {
      recommendedEvents: [...recommendedEvents].splice(0, 5),
      upcomingEvents: [...upcomingEvents].splice(0, 5),
      liveEvents: [...liveEvents].splice(0, 5),
    };
  }
  async handleJobRecommendations(currentUser: User) {
    const { profile: userProfile } = currentUser;
    const today = new Date();

    const jobs = await this.jobsRepository.find({
      where: { owner: { uuid: Not(userProfile.uuid) } },
      relations: ['skills', 'comments', 'reactions'],
    });

    const jobRecommedations = jobs
      .filter((job) => job.status === JobStatus.HIRING)
      .map((job) => {
        let score = 0;

        const daysUntilJobDeadline =
          (new Date(job.deadline).getTime() - today.getTime()) /
          (1000 * 3600 * 24);
        score += Math.max(0, 10 - daysUntilJobDeadline);

        const skillMatches = job.description
          ?.split(' ')
          .filter((word) =>
            userProfile.skills
              .map((skill: Skill) => skill.title)
              .includes(word),
          ).length;
        score += skillMatches * 5;

        if (job.location === userProfile.location) {
          score += 3;
        }

        const recentUpdate =
          (new Date(job.updated_at).getTime() - Date.now()) /
          (1000 * 3600 * 24);
        if (recentUpdate < 30) {
          score += 2;
        }

        const popularityScore = Math.min(job.views as number, 50) / 5;
        score += popularityScore;

        return { job, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((result) => result.job);

    return [...jobRecommedations].splice(0, 5);
  }
}
