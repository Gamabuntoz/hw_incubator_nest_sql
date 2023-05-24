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
    let filter = {};
    if (bannedBlogsId) {
      filter = { blogId: { $nin: bannedBlogsId } };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.postModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }
  async findAllPostsByBlogIds(blogIds: string[]) {
    return this.postModel.find({ blogId: { $in: blogIds } });
  }

  async findAllPostsByBlogId(id: string, queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.postModel
      .find({ blogId: id })
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async findAllPostLikes(id: string, status: string) {
    return this.postLikeModel.find({
      postId: id.toString(),
      status: status,
    });
  }

  async totalCountPostsExpectBanned(bannedBlogsId?: string[]) {
    let filter = {};
    if (bannedBlogsId) {
      filter = { blogId: { $nin: bannedBlogsId } };
    }
    return this.postModel.countDocuments(filter);
  }

  async totalCountPostsByBlogId(blogId: string) {
    return this.postModel.countDocuments({ blogId: blogId });
  }

  async createPost(newPost: Post) {
    await this.postModel.create(newPost);
    return newPost;
  }

  async findPostById(id: string) {
    return this.postModel.findOne({ _id: id });
  }

  async updatePost(id: string, inputPostData: InputPostDTO) {
    const result = await this.postModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          title: inputPostData.title,
          shortDescription: inputPostData.shortDescription,
          content: inputPostData.content,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deletePost(id: string) {
    const result = await this.postModel.deleteOne({
      _id: id,
    });
    return result.deletedCount === 1;
  }

  async countLikePostStatusInfo(postId: string, status: string) {
    return this.postLikeModel.countDocuments({
      postId: postId,
      status: status,
    });
  }

  async updatePostLike(postId: string, likeStatus: string, userId: string) {
    const result = await this.postLikeModel.updateOne(
      { postId: postId, userId: userId },
      { $set: { status: likeStatus } },
    );
    await this.changeCountPostLike(postId);
    return result.matchedCount === 1;
  }

  async setPostLike(newPostLike: PostLike) {
    await this.postLikeModel.create(newPostLike);
    await this.changeCountPostLike(newPostLike.postId);
    return newPostLike;
  }

  async findLastPostLikes(postId: string, bannedUsers?: string[]) {
    return this.postLikeModel
      .find({ postId: postId, status: 'Like', userId: { $nin: bannedUsers } })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }

  async findPostLikeByPostAndUserId(postId: string, userId: string) {
    return this.postLikeModel.findOne({
      postId: postId,
      userId: userId,
    });
  }

  async changeCountPostLike(postId: string) {
    const likeCount = await this.countLikePostStatusInfo(postId, 'Like');
    const dislikeCount = await this.countLikePostStatusInfo(postId, 'Dislike');
    await this.postModel.updateOne(
      { _id: new string(postId) },
      { $set: { likeCount, dislikeCount } },
    );
    return;
  }
}
