import { IsBoolean } from 'class-validator';

export class BlogInfoDTO {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: { userLogin: string; userId: string },
    public banInfo: { isBanned: boolean; banDate: string | null },
  ) {}
}

export class QueryBlogsDTO {
  constructor(
    public searchNameTerm: string,
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}
}

export class BlogBanDTO {
  @IsBoolean()
  isBanned: boolean;
}
