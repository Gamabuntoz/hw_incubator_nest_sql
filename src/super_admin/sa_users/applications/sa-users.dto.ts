import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class SAUserInfoDTO {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public banInfo: {
      isBanned: boolean;
      banDate: string | null;
      banReason: string | null;
    },
  ) {}
}

export class InputBanUserDTO {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @Length(20)
  @IsOptional()
  banReason: string;
}

export class QueryUsersDTO {
  constructor(
    public banStatus: string,
    public sortBy: string = 'createdAt',
    public sortDirection: 'ASC' | 'DESC' = 'DESC',
    public pageNumber: number = 1,
    public pageSize: number = 10,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
  ) {}
}
