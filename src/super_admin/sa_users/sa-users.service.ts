import { Injectable } from '@nestjs/common';
import { SAUsersRepository } from './sa-users.repository';
import { QueryUsersDTO, SAUserInfoDTO } from './applications/sa-users.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { User } from './applications/users.schema';

@Injectable()
export class SAUsersService {
  constructor(protected saUsersRepository: SAUsersRepository) {}

  async findUsers(
    queryData: QueryUsersDTO,
  ): Promise<Result<Paginated<SAUserInfoDTO[]>>> {
    const filter = this.saUsersRepository.createFilter(
      queryData.searchLoginTerm,
      queryData.searchEmailTerm,
      queryData.banStatus,
    );
    const totalCount = await this.saUsersRepository.totalCountUsers(filter);
    const findAllUsers: User[] = await this.saUsersRepository.findAllUsers(
      filter,
      queryData,
    );
    const paginatedUsers = await Paginated.getPaginated<SAUserInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: findAllUsers.map(
        (u) =>
          new SAUserInfoDTO(
            u._id.toString(),
            u.accountData.login,
            u.accountData.email,
            u.accountData.createdAt,
            {
              isBanned: u.banInformation.isBanned,
              banDate: u.banInformation.banDate
                ? u.banInformation.banDate.toISOString()
                : null,
              banReason: u.banInformation.banReason,
            },
          ),
      ),
    });

    return new Result<Paginated<SAUserInfoDTO[]>>(
      ResultCode.Success,
      paginatedUsers,
      null,
    );
  }
}
