import { IsIn, IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogExistsRule } from '../../../helpers/decorators/validate-blog-id.param.decorator';

type newestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};

export class PostInfoDTO {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: newestLikesType[];
    },
  ) {}
}

export class QueryPostsDTO {
  constructor(
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}
}

export class InputPostWithIdDTO {
  @Length(1, 30)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  title: string;
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  content: string;
  @IsString()
  @Validate(BlogExistsRule)
  blogId: string;
}

export class InputPostDTO {
  @Length(1, 30)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  title: string;
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  content: string;
}

const LikeStatus = ['None', 'Like', 'Dislike'];

export class InputLikeStatusDTO {
  @IsIn(LikeStatus)
  likeStatus: string;
}
