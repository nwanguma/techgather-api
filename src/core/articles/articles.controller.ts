import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Put,
  Patch,
  UseGuards,
  UseInterceptors,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateOrUpdateArticleDto } from './dtos/create-update-article.dto';
import { ArticlesService } from './articles.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { ArticleDto, PaginatedLimitedArticleDto } from './dtos/article.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from './../reactions/dtos/create-reaction.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedArticleDto))
  async getArticles(
    @GetCurrentUser('profile') profile: Profile,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('contentType') contentType: 'all' | 'following' | 'user',
    @Query('keyword') keyword: string,
    @Query('createdAt') createdAt: string,
    @Query('sortBy') sortBy: string,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.articlesService.getArticles(
      page,
      limit,
      contentType,
      profile,
      keyword,
      createdAt,
      orderBy,
      sortBy,
    );
  }

  @Get('/public')
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedArticleDto))
  async getPublicArticles(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('keyword') keyword: string,
    @Query('createdAt') createdAt: string,
    @Query('sortBy') sortBy: string,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.articlesService.getPublicArticles(
      page,
      limit,
      keyword,
      createdAt,
      orderBy,
      sortBy,
    );
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ArticleDto))
  async getCurrentUserArticle(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.articlesService.getCurrentUserArticle(id, profile.uuid);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ArticleDto))
  async getOneArticle(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.articlesService.getOneArticle(profile.uuid, id);
  }

  @Get(':id/public')
  @UseInterceptors(new CustomSerializerInterceptor(ArticleDto))
  async getOnePublicArticle(@Param('id') id: string) {
    return await this.articlesService.getOnePublicArticle(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ArticleDto))
  async createArticle(
    @GetCurrentUser('profile') profile: Profile,
    @Body() body: CreateOrUpdateArticleDto,
  ) {
    return await this.articlesService.createArticle(body, profile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ArticleDto))
  async updateArticle(
    @GetCurrentUser() { profile }: User,
    @Param('id') articleId: string,
    @Body() createOrUpdateProfileDto: CreateOrUpdateArticleDto,
  ) {
    return await this.articlesService.udpateArticle(
      articleId,
      createOrUpdateProfileDto,
      profile,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') articleId: string,
  ) {
    return await this.articlesService.deleteArticle(articleId, profile.uuid);
  }

  @Patch(':id/views')
  @UseGuards(JwtAuthGuard)
  async updateArticleViews(@Param('id') articleId: string) {
    return await this.articlesService.updateArticleViews(articleId);
  }

  @Post(':articleId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @GetCurrentUser() user: User,
    @Param('articleId')
    articleId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.articlesService.addComment(
      user,
      articleId,
      createCommentDto,
    );
  }

  @Delete(':articleId/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @GetCurrentUser('profile') profile: Profile,
    @Param('commentId') commentId: string,
  ) {
    return await this.articlesService.deleteComment(commentId, profile.uuid);
  }

  @Post(':articleId/reactions')
  @UseGuards(JwtAuthGuard)
  async addOrRemoveReaction(
    @GetCurrentUser() user: User,
    @Param('articleId')
    articleId: string,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return await this.articlesService.addOrRemoveReaction(
      user,
      articleId,
      createReactionDto,
    );
  }
}
