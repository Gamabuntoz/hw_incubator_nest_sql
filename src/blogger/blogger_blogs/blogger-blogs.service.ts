import { Injectable } from '@nestjs/common';
import { BloggerBlogsRepository } from './blogger-blogs.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BloggerBlogInfoDTO,
  BloggerCommentInfoDTO,
  QueryBlogsDTO,
  QueryCommentsDTO,
} from './applications/blogger-blogs.dto';
import { CommentsRepository } from '../../public/comments/comments.repository';
import { PostsRepository } from '../../public/posts/posts.repository';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async findAllCommentForBlogger(
    queryData: QueryCommentsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BloggerCommentInfoDTO[]>>> {
    const allBlogs = await this.bloggerBlogsRepository.findAllBlogsByOwnerId(
      currentUserId,
    );
    const blogsIds = allBlogs.map((b) => b.id);
    const allPosts = await this.postsRepository.findAllPostsByBlogIds(blogsIds);
    const postsIds = allPosts.map((p) => p.id);
    const totalCount =
      await this.commentsRepository.totalCountCommentsByPostsIds(postsIds);
    const allComments = await this.commentsRepository.findAllCommentsByPostIds(
      postsIds,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<
      BloggerCommentInfoDTO[]
    >({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allComments.map(async (c) => {
          const likeStatusCurrentUser =
            await this.commentsRepository.findCommentLikeByCommentAndUserId(
              c.id,
              currentUserId,
            );
          const post = await this.postsRepository.findPostById(c.postId);
          return new BloggerCommentInfoDTO(
            c.id,
            c.content,
            c.createdAt,
            {
              userId: c.userId,
              userLogin: c.userLogin,
            },
            {
              dislikesCount: c.dislikeCount,
              likesCount: c.likeCount,
              myStatus: likeStatusCurrentUser
                ? likeStatusCurrentUser.status
                : 'None',
            },
            {
              id: post.id,
              title: post.title,
              blogId: post.blogId,
              blogName: post.blogName,
            },
          );
        }),
      ),
    });
    return new Result<Paginated<BloggerCommentInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }

  async findAllBlogs(
    queryData: QueryBlogsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BloggerBlogInfoDTO[]>>> {
    const filter: any = { ownerId: currentUserId };
    filter['searchNameTerm'] = queryData.searchNameTerm
      ? queryData.searchNameTerm
      : null;
    const totalCount = await this.bloggerBlogsRepository.totalCountBlogs(
      filter,
    );
    const allBlogs = await this.bloggerBlogsRepository.findAllBlogs(
      filter,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<BloggerBlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BloggerBlogInfoDTO(
            b.id,
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    });
    return new Result<Paginated<BloggerBlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
