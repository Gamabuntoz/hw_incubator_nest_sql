import { Injectable } from '@nestjs/common';
import { Comments } from './applications/comments.entity';
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import { InputCommentDTO } from './applications/comments.dto';
import { CommentLikes } from './applications/comments-likes.entity';
import { QueryCommentsDTO } from '../../blogger/blogger_blogs/applications/blogger-blogs.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findCommentById(id: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "comments"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[0];
  }

  async findAllCommentLikes(id: string, status: string) {
    return this.dataSource.query(
      `
      SELECT * FROM "comment_likes"
      WHERE "commentId" = $1 AND "status" = $2
       `,
      [id, status],
    );
  }

  async createComment(newComment: Comments) {
    await this.dataSource.query(
      `
      INSERT INTO "comments"
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [
        newComment.id,
        newComment.content,
        newComment.createdAt,
        newComment.userLogin,
        newComment.likeCount,
        newComment.dislikeCount,
        newComment.user,
        newComment.post,
      ],
    );
    return newComment;
  }

  async updateCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ) {
    const result = await this.dataSource.query(
      `
      UPDATE "comment_likes"
      SET "status" = $1
      WHERE "commentId" = $2 AND "userId" = $3
      `,
      [likeStatus, commentId, userId],
    );
    await this.changeCountCommentLike(commentId);
    return result[1] === 1;
  }

  async setCommentLike(newCommentLike: CommentLikes) {
    await this.dataSource.query(
      `
      INSERT INTO "comment_likes"
      VALUES ($1, $2, $3, $4, $5);
      `,
      [
        newCommentLike.id,
        newCommentLike.status,
        newCommentLike.addedAt,
        newCommentLike.user,
        newCommentLike.comment,
      ],
    );
    await this.changeCountCommentLike(newCommentLike.comment);
    return newCommentLike;
  }

  async countLikeCommentStatusInfo(commentId: string, status: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("comment_likes") 
      FROM "comment_likes"
      WHERE "commentId" = $1 AND "status" = $2
      `,
      [commentId, status],
    );
    return result[0].count;
  }

  async changeCountCommentLike(commentId: string) {
    const likeCount = await this.countLikeCommentStatusInfo(commentId, 'Like');
    const dislikeCount = await this.countLikeCommentStatusInfo(
      commentId,
      'Dislike',
    );
    const result = await this.dataSource.query(
      `
      UPDATE "comments"
      SET "likeCount" = $1, "dislikeCount" = $2
      WHERE id = $3
      `,
      [likeCount, dislikeCount, commentId],
    );
    return result[1] === 1;
  }

  async updateComment(id: string, inputData: InputCommentDTO) {
    const result = await this.dataSource.query(
      `
      UPDATE "comments"
      SET "content" = $1
      WHERE id = $2
      `,
      [inputData.content, id],
    );
    return result[1] === 1;
  }

  async deleteComment(id: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "comments"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[1] === 1;
  }

  async findAllCommentsByPostId(id: string, queryData: QueryPostsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    return this.dataSource.query(
      `
      SELECT * FROM "comments" 
      WHERE "postId" = $1
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [id, queryData.pageSize, (queryData.pageNumber - 1) * queryData.pageSize],
    );
  }

  async findAllCommentsForAllBloggerBlogsAllPosts(
    ownerId: string,
    queryData: QueryCommentsDTO,
  ) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    return this.dataSource.query(
      `
      SELECT * FROM "comments" 
      WHERE "postId" IN (
            SELECT "id" FROM "posts" 
            WHERE "blogId" IN (   
                    SELECT "id"     
                    FROM "blogs" 
                    WHERE "ownerId" = $1
                    )
            )
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [
        ownerId,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }

  async findCommentLikeByCommentAndUserId(commentId: string, userId: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "comment_likes"
      WHERE "commentId" = $1 AND "userId" = $2
       `,
      [commentId, userId],
    );
    return result[0];
  }

  async totalCountComments(id: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("comments") 
      FROM "comments"
      WHERE "postId" = $1
      `,
      [id],
    );
    return result[0].count;
  }

  async totalCountCommentsForAllBloggerBlogsAllPosts(ownerId: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("comments") 
      FROM "comments"
      WHERE "postId" IN (
            SELECT "id" FROM "posts" 
            WHERE "blogId" IN (   
                    SELECT "id"     
                    FROM "blogs" 
                    WHERE "ownerId" = $1
                    )
            )
      `,
      [ownerId],
    );
    return result[0].count;
  }
}
