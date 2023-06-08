import { Injectable } from '@nestjs/common';
import { Users } from './applications/users.entity';
import { FilterQuery } from 'mongoose';
import { InputBanUserDTO, QueryUsersDTO } from './applications/sa-users.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SAUsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly dbUsersRepository: Repository<Users>,
  ) {}

  async findAllUsers(filter: FilterQuery<Users>, queryData: QueryUsersDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const queryBuilder = this.dbUsersRepository.createQueryBuilder('u');
    if (queryData.banStatus) {
      queryBuilder.where({ 'u.userIsBanned': queryData.banStatus });
    }
    if (queryData.searchEmailTerm || queryData.searchLoginTerm) {
      queryBuilder.where(
        "u.email ILIKE '%' || :emailTerm || '%' OR u.login ILIKE '%' || :loginTerm || '%'",
        {
          emailTerm: queryData.searchEmailTerm,
          loginTerm: queryData.searchLoginTerm,
        },
      );
    }
    queryBuilder
      .orderBy(`u.${sortBy}`, queryData.sortDirection)
      .limit(queryData.pageSize)
      .offset((queryData.pageNumber - 1) * queryData.pageSize);
    return queryBuilder.getMany();
  }

  async totalCountUsers(queryData) {
    const queryBuilder = this.dbUsersRepository.createQueryBuilder('u');
    if (queryData.banStatus) {
      queryBuilder.where({ userIsBanned: queryData.banStatus });
    }
    if (queryData.searchEmailTerm || queryData.searchLoginTerm) {
      queryBuilder.where(
        "u.email ILIKE '%' || :emailTerm || '%' OR u.login ILIKE '%' || :loginTerm || '%'",
        {
          emailTerm: queryData.searchEmailTerm,
          loginTerm: queryData.searchLoginTerm,
        },
      );
    }
    return queryBuilder.getCount();
  }

  async createUser(newUser: Users) {
    await this.dbUsersRepository.insert(newUser);
    return newUser;
  }

  async findUserById(id: string) {
    return this.dbUsersRepository.findOne({ where: { id: id } });
  }

  async updateUserBanStatus(userId: string, inputData: InputBanUserDTO) {
    return this.dbUsersRepository.update(
      { id: userId },
      {
        userIsBanned: inputData.isBanned,
        userBanReason: inputData.isBanned ? inputData.banReason : null,
        userBanDate: inputData.isBanned ? new Date().toISOString() : null,
      },
    );
  }

  async deleteUser(id: string) {
    return this.dbUsersRepository.delete({ id: id });
  }
}
