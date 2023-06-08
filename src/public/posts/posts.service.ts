import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInfoDTO, QueryPostsDTO } from './applications/posts.dto';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentInfoDTO } from '../comments/applications/comments.dto';
import { CommentsService } from '../comments/comments.service';
import { Paginated } from '../../helpers/paginated';
import { Result, ResultCode } from '../../helpers/contract';
import { BloggerBlogsRepository } from '../../blogger/blogger_blogs/blogger-blogs.repository';
import { AuthRepository } from '../auth/auth.repository';
import { Blogs } from '../../blogger/blogger_blogs/applications/blogger-blogs.entity';
import { PostLikes } from './applications/posts-likes.entity';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected authRepository: AuthRepository,
    protected commentsService: CommentsService,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async findCommentsByPostId(
    id: string,
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<CommentInfoDTO[]>>> {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById)
      return new Result<Paginated<CommentInfoDTO[]>>(
        ResultCode.NotFound,
        null,
        'Post not found',
      );
    const totalCount = await this.commentsRepository.totalCountComments(id);
    const allComments = await this.commentsRepository.findAllCommentsByPostId(
      id,
      queryData,
    );
    const paginatedComments = await Paginated.getPaginated<CommentInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allComments.map(async (c) => {
          const countBannedLikesOwner =
            await this.commentsService.countBannedStatusOwner(c.id, 'Like');
          const countBannedDislikesOwner =
            await this.commentsService.countBannedStatusOwner(c.id, 'Dislike');
          let likeStatusCurrentUser;
          if (userId) {
            likeStatusCurrentUser =
              await this.commentsRepository.findCommentLikeByCommentAndUserId(
                c.id,
                userId,
              );
          }
          return this.commentsService.createCommentViewInfo(
            c,
            likeStatusCurrentUser,
            countBannedLikesOwner,
            countBannedDislikesOwner,
          );
        }),
      ),
    });

    return new Result<Paginated<CommentInfoDTO[]>>(
      ResultCode.Success,
      paginatedComments,
      null,
    );
  }

  async findAllPosts(
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<PostInfoDTO[]>>> {
    const totalCount = await this.postsRepository.totalCountPostsExpectBanned();
    const allPosts = await this.postsRepository.findAllPosts(queryData);
    const paginatedPosts = await Paginated.getPaginated<PostInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allPosts.map(async (p) => {
          let likeStatusCurrentUser;
          const countBannedLikesOwner = await this.countBannedStatusOwner(
            p.id,
            'Like',
          );
          const countBannedDislikesOwner = await this.countBannedStatusOwner(
            p.id,
            'Dislike',
          );
          if (userId) {
            likeStatusCurrentUser =
              await this.postsRepository.findPostLikeByPostAndUserId(
                p.id,
                userId,
              );
          }
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p.id,
          );
          return this.createPostViewInfo(
            p,
            lastPostLikes,
            likeStatusCurrentUser,
            countBannedLikesOwner,
            countBannedDislikesOwner,
          );
        }),
      ),
    });
    return new Result<Paginated<PostInfoDTO[]>>(
      ResultCode.Success,
      paginatedPosts,
      null,
    );
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<Result<PostInfoDTO>> {
    const postById = await this.postsRepository.findPostById(postId);
    if (!postById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'post not found',
      );
    const checkBlog: Blogs = await this.bloggerBlogsRepository.findBlogById(
      postById.blogId,
    );
    if (checkBlog.blogIsBanned)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'blog is banned',
      );
    const countBannedLikesOwner = await this.countBannedStatusOwner(
      postId,
      'Like',
    );
    const countBannedDislikesOwner = await this.countBannedStatusOwner(
      postId,
      'Dislike',
    );
    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.postsRepository.findPostLikeByPostAndUserId(postId, userId);
    }
    const lastPostLikes = await this.postsRepository.findLastPostLikes(postId);
    const postView = await this.createPostViewInfo(
      postById,
      lastPostLikes,
      likeStatusCurrentUser,
      countBannedLikesOwner,
      countBannedDislikesOwner,
    );
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }

  async countBannedStatusOwner(postId: string, status: string) {
    return this.authRepository.countBannedUsersPostLikeOwner(postId, status);
  }

  async createPostViewInfo(
    post,
    lastPostLikes,
    likeStatusCurrentUser?: PostLikes,
    countBannedLikesOwner?,
    countBannedDislikesOwner?,
  ): Promise<PostInfoDTO> {
    return new PostInfoDTO(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      {
        likesCount: countBannedLikesOwner
          ? post.likeCount - countBannedLikesOwner
          : post.likeCount,
        dislikesCount: countBannedDislikesOwner
          ? post.dislikeCount - countBannedDislikesOwner
          : post.dislikeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
        newestLikes: await Promise.all(
          lastPostLikes.map(async (l) => {
            const user = await this.authRepository.findUserById(l.userId);
            return {
              addedAt: l.addedAt,
              userId: l.userId,
              login: user?.login,
            };
          }),
        ),
      },
    );
  }
}
