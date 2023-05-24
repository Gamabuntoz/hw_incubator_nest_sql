import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInfoDTO, QueryPostsDTO } from './applications/posts.dto';
import { Types } from 'mongoose';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentInfoDTO } from '../comments/applications/comments.dto';
import { Post } from './applications/posts.entity';
import { PostLike } from './applications/posts-likes.schema';
import { CommentsService } from '../comments/comments.service';
import { Paginated } from '../../helpers/paginated';
import { Result, ResultCode } from '../../helpers/contract';
import { BloggerBlogsRepository } from '../../blogger/blogger_blogs/blogger-blogs.repository';
import { Blog } from '../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
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
    const totalCount = await this.commentsRepository.totalCountComments(
      id.toString(),
    );
    const allComments = await this.commentsRepository.findAllCommentsByPostId(
      id.toString(),
      queryData,
    );
    const paginatedComments = await Paginated.getPaginated<CommentInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allComments.map(async (c) => {
          const countBannedLikesOwner =
            await this.commentsService.countBannedStatusOwner(c._id, 'Like');
          const countBannedDislikesOwner =
            await this.commentsService.countBannedStatusOwner(c._id, 'Dislike');
          let likeStatusCurrentUser;
          if (userId) {
            likeStatusCurrentUser =
              await this.commentsRepository.findCommentLikeByCommentAndUserId(
                c._id.toString(),
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
    const allBannedBlogs =
      await this.bloggerBlogsRepository.findAllBannedBlogs();
    const allBannedBlogsId = allBannedBlogs.map((b) => b._id.toString());
    const totalCount = await this.postsRepository.totalCountPostsExpectBanned(
      allBannedBlogsId,
    );
    const allPosts = await this.postsRepository.findAllPosts(
      queryData,
      allBannedBlogsId,
    );
    const paginatedPosts = await Paginated.getPaginated<PostInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allPosts.map(async (p) => {
          let likeStatusCurrentUser;
          const countBannedLikesOwner = await this.countBannedStatusOwner(
            p._id,
            'Like',
          );
          const countBannedDislikesOwner = await this.countBannedStatusOwner(
            p._id,
            'Dislike',
          );
          const idBannedUsers = await this.idBannedStatusOwner(p._id, 'Like');
          if (userId) {
            likeStatusCurrentUser =
              await this.postsRepository.findPostLikeByPostAndUserId(
                p._id.toString(),
                userId,
              );
          }
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p._id.toString(),
            idBannedUsers,
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
    id: string,
    userId?: string,
  ): Promise<Result<PostInfoDTO>> {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'post not found',
      );
    const checkBlog: Blog = await this.bloggerBlogsRepository.findBlogById(
      new string(postById.blogId),
    );
    if (checkBlog.banInformation.isBanned)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'blog is banned',
      );
    const countBannedLikesOwner = await this.countBannedStatusOwner(id, 'Like');
    const countBannedDislikesOwner = await this.countBannedStatusOwner(
      id,
      'Dislike',
    );
    const idBannedUsers = await this.idBannedStatusOwner(id, 'Like');
    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.postsRepository.findPostLikeByPostAndUserId(
          id.toString(),
          userId,
        );
    }
    const lastPostLikes = await this.postsRepository.findLastPostLikes(
      id.toString(),
      idBannedUsers,
    );
    const postView = await this.createPostViewInfo(
      postById,
      lastPostLikes,
      likeStatusCurrentUser,
      countBannedLikesOwner,
      countBannedDislikesOwner,
    );
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }

  async countBannedStatusOwner(id: string, status: string) {
    const allLikes: PostLike[] = await this.postsRepository.findAllPostLikes(
      id,
      status,
    );
    const allUsersLikeOwner = allLikes.map((p) => new string(p.userId));
    return this.usersRepository.countBannedUsersInIdArray(allUsersLikeOwner);
  }

  async idBannedStatusOwner(id: string, status: string) {
    const allLikes: PostLike[] = await this.postsRepository.findAllPostLikes(
      id,
      status,
    );
    const allUsersLikeOwner = allLikes.map((p) => new string(p.userId));
    const allBannedUsers = await this.usersRepository.allIdBannedUsers(
      allUsersLikeOwner,
    );
    return allBannedUsers.map((u) => u._id.toString());
  }

  async createPostViewInfo(
    post: Post,
    lastPostLikes: PostLike[],
    likeStatusCurrentUser?: PostLike,
    countBannedLikesOwner?,
    countBannedDislikesOwner?,
  ): Promise<PostInfoDTO> {
    return new PostInfoDTO(
      post._id.toString(),
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
            const user = await this.usersRepository.findUserById(l.userId);
            return {
              addedAt: l.addedAt.toISOString(),
              userId: l.userId,
              login: user?.accountData.login,
            };
          }),
        ),
      },
    );
  }
}
