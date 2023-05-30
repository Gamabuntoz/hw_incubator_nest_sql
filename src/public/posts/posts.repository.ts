import { Injectable } from '@nestjs/common';
import { Posts } from './applications/posts.entity';
import { InputPostDTO, QueryPostsDTO } from './applications/posts.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikes } from './applications/posts-likes.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllPosts(queryData: QueryPostsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    return this.dataSource.query(
      `
      SELECT * FROM "posts" 
      WHERE "blogId" NOT IN (
        SELECT "id" FROM "blogs"
        WHERE "blogIsBanned" = true
      )
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $1
      OFFSET $2
      `,
      [queryData.pageSize, (queryData.pageNumber - 1) * queryData.pageSize],
    );
  }

  async findAllPostsByBlogId(id: string, queryData: QueryPostsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    return this.dataSource.query(
      `
      SELECT * FROM "posts" 
      WHERE "blogId" = $1
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [id, queryData.pageSize, (queryData.pageNumber - 1) * queryData.pageSize],
    );
  }

  async totalCountPostsExpectBanned() {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("posts") 
      FROM "posts"
      WHERE "blogId" NOT IN (
        SELECT "id" FROM "blogs"
        WHERE "blogIsBanned" = true
      )
      `,
    );
    return result[0].count;
  }

  async totalCountPostsByBlogId(blogId: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("posts") 
      FROM "posts"
      WHERE "blogId" = $1
      `,
      [blogId],
    );
    return result[0].count;
  }

  async createPost(newPost: Posts) {
    await this.dataSource.query(
      `
      INSERT INTO "posts"
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `,
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogName,
        newPost.createdAt,
        newPost.likeCount,
        newPost.dislikeCount,
        newPost.blog,
      ],
    );
    return newPost;
  }

  async findPostById(id: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "posts"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[0];
  }

  async updatePost(id: string, inputPostData: InputPostDTO) {
    const result = await this.dataSource.query(
      `
      UPDATE "posts"
      SET "title" = $1, "shortDescription" = $2, "content" = $3
      WHERE id = $4
      `,
      [
        inputPostData.title,
        inputPostData.shortDescription,
        inputPostData.content,
        id,
      ],
    );
    return result[1] === 1;
  }

  async deletePost(id: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "posts"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[1] === 1;
  }

  async findAllPostsByBlogIds(blogIds: string[]) {
    return this.dataSource.query(
      `
      SELECT "id" FROM "posts" 
      WHERE "blogId" IN (   
            SELECT "id"     
            FROM "blogs" 
            WHERE "ownerId" = $1
            )
      `,
      [blogIds],
    );
  }

  async countLikePostStatusInfo(postId: string, status: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("post_likes") 
      FROM "post_likes"
      WHERE "postId" = $1 AND "status" = $2
      `,
      [postId, status],
    );
    return result[0].count;
  }

  async updatePostLike(postId: string, likeStatus: string, userId: string) {
    const result = await this.dataSource.query(
      `
      UPDATE "post_likes"
      SET "status" = $1
      WHERE "postId" = $2 AND "userId" = $3
      `,
      [likeStatus, postId, userId],
    );
    await this.changeCountPostLike(postId);
    return result[1] === 1;
  }

  async setPostLike(newPostLike: PostLikes) {
    await this.dataSource.query(
      `
      INSERT INTO "post_likes"
      VALUES ($1, $2, $3, $4, $5);
      `,
      [
        newPostLike.id,
        newPostLike.status,
        newPostLike.addedAt,
        newPostLike.user,
        newPostLike.post,
      ],
    );
    await this.changeCountPostLike(newPostLike.post);
    return newPostLike;
  }

  async findLastPostLikes(postId: string) {
    return this.dataSource.query(
      `
      SELECT * FROM "post_likes" 
      WHERE "postId" = $1 AND "status" = 'Like' AND "userId" NOT IN (
                SELECT "id" FROM "users" 
                WHERE "userIsBanned" = true
                )      
      ORDER BY "addedAt" DESC
      LIMIT 3
      `,
      [postId],
    );
  }

  async findPostLikeByPostAndUserId(postId: string, userId: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "post_likes"
      WHERE "postId" = $1 AND "userId" = $2
      `,
      [postId, userId],
    );
    return result[0];
  }

  async changeCountPostLike(postId: string) {
    const likeCount = await this.countLikePostStatusInfo(postId, 'Like');
    const dislikeCount = await this.countLikePostStatusInfo(postId, 'Dislike');
    const result = await this.dataSource.query(
      `
      UPDATE "posts"
      SET "likeCount" = $1, "dislikeCount" = $2
      WHERE "id" = $3
      `,
      [likeCount, dislikeCount, postId],
    );
    return result[1] === 1;
  }
}
