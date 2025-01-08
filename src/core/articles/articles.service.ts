import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { Article } from './entities/article.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CreateOrUpdateArticleDto } from './dtos/create-update-article.dto';
import { ResourceTypes } from './../../common/constants/index.constants';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { ReactionsService } from '../reactions/reactions.service';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
// import { ActivitiesService } from '../activities/activities.service';
import { User } from '../users/entities/user.entity';
// import { ActivityTypes } from '../activities/activities.constants';
import { Reaction } from '../reactions/entities/reaction.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    // private readonly activitiesService: ActivitiesService,
  ) {}

  async getArticles(
    page: number = 1,
    limit: number = 10,
    contentType: 'following' | 'all' | 'user',
    profile: Profile,
    keyword?: string,
    createdAt?: string,
    orderBy: 'ASC' | 'DESC' = 'DESC',
    sortBy: string = 'created_at',
  ) {
    const followingUuids =
      profile.following?.map((follow) => follow.user.uuid) || [];

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.owner', 'owner')
      .leftJoinAndSelect('article.comments', 'comments')
      .leftJoinAndSelect('article.reactions', 'reactions');

    if (contentType === 'following' && followingUuids.length > 0) {
      queryBuilder.andWhere('owner.uuid IN (:...followingUuids)', {
        followingUuids,
      });
    } else if (contentType === 'following' && followingUuids.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0,
        perPage: limit,
      };
    } else if (contentType === 'user') {
      queryBuilder.andWhere('owner.uuid = :uuid', { uuid: profile.uuid });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('article.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('article.body ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (createdAt) {
      queryBuilder.andWhere('article.created_at >= :createdAt', { createdAt });
    }

    queryBuilder.orderBy(
      `article.${sortBy || 'created_at'}`,
      orderBy || 'DESC',
    );
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    };
  }

  async getPublicArticles(
    page: number = 1,
    limit: number = 10,
    keyword?: string,
    createdAt?: string,
    orderBy: 'ASC' | 'DESC' = 'DESC',
    sortBy: string = 'created_at',
  ) {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.owner', 'owner')
      .leftJoinAndSelect('article.comments', 'comments')
      .leftJoinAndSelect('article.reactions', 'reactions');

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('article.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('article.body ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (createdAt) {
      queryBuilder.andWhere('article.created_at >= :createdAt', { createdAt });
    }

    queryBuilder.orderBy(
      `article.${sortBy || 'created_at'}`,
      orderBy || 'DESC',
    );
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    };
  }

  async getOneArticle(currentUserProfileId: string, articleId: string) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
      relations: ['owner', 'comments', 'reactions'],
    });

    if (!article) throw new NotFoundException('Article does not exist');

    currentUserProfileId !== article.owner.uuid &&
      this.updateArticleViews(article.uuid);

    return article;
  }

  async getOnePublicArticle(articleId: string) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
      relations: ['owner', 'comments', 'reactions'],
    });

    if (!article) throw new NotFoundException('Article does not exist');

    this.updateArticleViews(article.uuid);

    return article;
  }

  async getCurrentUserArticle(id: string, profileId: string) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: id, owner: { uuid: profileId } },
      relations: ['owner', 'comments', 'reactions'],
    });

    if (!article) throw new NotFoundException('Article does not exist');

    this.updateArticleViews(article.uuid);

    return article;
  }

  async createArticle(articleDto: CreateOrUpdateArticleDto, profile: Profile) {
    const article = await this.findOrCreateArticle({ articleDto, profile });

    return article;
  }

  async udpateArticle(
    articleId: string,
    articleDto: CreateOrUpdateArticleDto,
    profile: Profile,
  ) {
    const article = await this.findOrCreateArticle({
      articleDto,
      profile,
      articleId,
    });

    return article;
  }

  async findOrCreateArticle({
    articleId,
    profile,
    articleDto,
  }: {
    articleDto: CreateOrUpdateArticleDto;
    profile: Profile;
    articleId?: string;
  }) {
    let article;

    if (articleId) {
      article = await this.articlesRepository.findOne({
        where: { uuid: articleId, owner: { uuid: profile.uuid } },
        relations: ['owner'],
      });

      if (!article) throw new NotFoundException('Article does not exist');
      if (article.owner.uuid !== profile.uuid)
        throw new ForbiddenException(
          'You are not allowed to update this article',
        );
    }

    if (!article) {
      article = this.articlesRepository.create({
        ...articleDto,
        views: 0,
        owner: profile,
      });

      article = await this.articlesRepository.save(article);
    } else {
      Object.assign(article, {
        ...articleDto,
        owner: article.owner,
        views: article.views,
      });

      article = await this.articlesRepository.save(article);
    }

    return article;
  }

  async deleteArticle(articleId: string, profileId: string) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
      relations: ['owner'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.owner.uuid !== profileId) {
      throw new ForbiddenException(
        'You are not allowed to delete this article',
      );
    }

    return await this.articlesRepository.remove(article);
  }

  async updateArticleViews(articleId: string) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
    });

    if (!article) throw new NotFoundException('Article does not exist');
    Object.assign(article, { ...article, views: ++article.views });

    return await this.articlesRepository.save(article);
  }

  async addComment(
    user: User,
    articleId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
      relations: ['owner'],
    });

    if (!article) throw new NotFoundException('Article does not exist');

    const comment = await this.commentsService.createComment(
      user,
      article,
      ResourceTypes.ARTICLE,
      createCommentDto,
    );

    // const activityData = { type: ActivityTypes.COMMENT };
    // this.activitiesService.createActivity(
    //   user.profile,
    //   article,
    //   ResourceTypes.ARTICLE,
    //   activityData,
    // );

    return comment;
  }

  async deleteComment(commentId: string, profileId: string) {
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  async addOrRemoveReaction(
    user: User,
    articleId: string,
    createReactionDto: CreateReactionDto,
  ) {
    const article = await this.articlesRepository.findOne({
      where: { uuid: articleId },
      relations: ['owner'],
    });

    if (!article) throw new NotFoundException('Article does not exist');

    const result = await this.reactionsService.handleReaction(
      user,
      article,
      ResourceTypes.ARTICLE,
      createReactionDto,
    );

    // if (result.status) {
    //   const activityData = { type: ActivityTypes.LIKE };
    //   this.activitiesService.createActivity(
    //     user.profile,
    //     article,
    //     ResourceTypes.ARTICLE,
    //     activityData,
    //   );
    // }

    return result.data as Reaction;
  }
}
