import { Injectable } from '@nestjs/common';
import { SAUsersRepository } from './sa-users.repository';
import { QueryUsersDTO, SAUserInfoDTO } from './applications/sa-users.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { Users } from './applications/users.entity';

@Injectable()
export class SAUsersService {
  constructor(protected saUsersRepository: SAUsersRepository) {}

  async findUsers(
    queryData: QueryUsersDTO,
  ): Promise<Result<Paginated<SAUserInfoDTO[]>>> {
    const filter = this.createFilter(
      queryData.searchLoginTerm,
      queryData.searchEmailTerm,
      queryData.banStatus,
    );
    const totalCount = await this.saUsersRepository.totalCountUsers(filter);
    const findAllUsers: Users[] = await this.saUsersRepository.findAllUsers(
      filter,
      queryData,
    );
    const paginatedUsers = await Paginated.getPaginated<SAUserInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount: totalCount,
      items: findAllUsers.map(
        (u) =>
          new SAUserInfoDTO(u.id, u.login, u.email, u.createdAt, {
            isBanned: u.userIsBanned,
            banDate: u.userBanDate ? u.userBanDate : null,
            banReason: u.userBanReason ? u.userBanReason : null,
          }),
      ),
    });

    return new Result<Paginated<SAUserInfoDTO[]>>(
      ResultCode.Success,
      paginatedUsers,
      null,
    );
  }

  createFilter(searchLoginTerm?, searchEmailTerm?, banStatus?) {
    const filter: any = {};

    filter['banStatus'] = banStatus === 'banned';
    if (!banStatus && banStatus === 'all') {
      filter['banStatus'] = null;
    }

    filter['searchLoginTerm'] = null;
    if (searchLoginTerm) {
      filter['searchLoginTerm'] = searchLoginTerm;
    }

    filter['searchEmailTerm'] = null;
    if (searchLoginTerm) {
      filter['searchEmailTerm'] = searchEmailTerm;
    }

    return filter;
  }
}
