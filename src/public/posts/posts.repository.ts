import { Injectable } from '@nestjs/common';
import { Posts } from './applications/posts.entity';
import { InputPostDTO, QueryPostsDTO } from './applications/posts.dto';
import { PostLike } from './applications/posts-likes.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllPosts(queryData: QueryPostsDTO, bannedBlogsId?: string[]) {
    const filter: any = {};
    filter['bannedBlogsId'] = bannedBlogsId ? bannedBlogsId : null;
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    return this.dataSource.query(
      `
      SELECT * FROM "posts" 
      WHERE ($1 is null OR "blogId" NOT IN $1)
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [
        filter.bannedBlogsId,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
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

  async totalCountPostsExpectBanned(bannedBlogsId?: string[]) {
    const filter: any = {};
    filter['bannedBlogsId'] = bannedBlogsId ? bannedBlogsId : null;
    const result = await this.dataSource.query(
      `
      SELECT COUNT("posts") 
      FROM "posts"
      WHERE ($1 is null OR "blogId" NOT IN $1)
      `,
      [filter.bannedBlogsId],
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

  /*async findAllPostsByBlogIds(blogIds: string[]) {
    return this.postModel.find({ blogId: { $in: blogIds } });
  }*/

  /*async findAllPostLikes(id: string, status: string) {
    return this.postLikeModel.find({
      postId: id.toString(),
      status: status,
    });
  }*/

  /*async countLikePostStatusInfo(postId: string, status: string) {
    return this.postLikeModel.countDocuments({
      postId: postId,
      status: status,
    });
  }*/

  /*async updatePostLike(postId: string, likeStatus: string, userId: string) {
    const result = await this.postLikeModel.updateOne(
      { postId: postId, userId: userId },
      { $set: { status: likeStatus } },
    );
    await this.changeCountPostLike(postId);
    return result.matchedCount === 1;
  }*/

  /*async setPostLike(newPostLike: PostLike) {
    await this.postLikeModel.create(newPostLike);
    await this.changeCountPostLike(newPostLike.postId);
    return newPostLike;
  }*/

  /*async findLastPostLikes(postId: string, bannedUsers?: string[]) {
    return this.postLikeModel
      .find({ postId: postId, status: 'Like', userId: { $nin: bannedUsers } })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }*/

  /*async findPostLikeByPostAndUserId(postId: string, userId: string) {
    return this.postLikeModel.findOne({
      postId: postId,
      userId: userId,
    });
  }*/

  /*async changeCountPostLike(postId: string) {
    const likeCount = await this.countLikePostStatusInfo(postId, 'Like');
    const dislikeCount = await this.countLikePostStatusInfo(postId, 'Dislike');
    await this.postModel.updateOne(
      { _id: new string(postId) },
      { $set: { likeCount, dislikeCount } },
    );
    return;
  }*/
}
