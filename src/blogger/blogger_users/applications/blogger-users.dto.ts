import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import { BlogExistsRule } from '../../../helpers/decorators/validate-blog-id.param.decorator';

export class QueryBannedUsersForBlogDTO {
  constructor(
    public searchLoginTerm: string,
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}
}

export class BannedUsersForBlogInfoDTO {
  constructor(
    public id: string,
    public login: string,
    public banInfo: {
      isBanned: boolean;
      banDate: string;
      banReason: string;
    },
  ) {}
}

export class InputBanUserForBlogDTO {
  @IsBoolean()
  isBanned: boolean;
  @IsString()
  @Length(20)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  banReason: string;
  @Validate(BlogExistsRule)
  blogId: string;
}
