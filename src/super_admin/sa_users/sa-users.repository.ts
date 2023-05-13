import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './applications/users.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { InputBanUserDTO, QueryUsersDTO } from './applications/sa-users.dto';

@Injectable()
export class SAUsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAllUsers(filter: FilterQuery<User>, queryData: QueryUsersDTO) {
    let sort = 'accountData.createdAt';
    if (queryData.sortBy) {
      sort = `accountData.${queryData.sortBy}`;
    }
    return this.userModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }
  createFilter(searchLoginTerm?, searchEmailTerm?, banStatus?) {
    let filter: any = { $or: [] };
    const banStatusForSearch = banStatus === 'banned';
    if (banStatus && banStatus !== 'all') {
      filter['banInformation.isBanned'] = banStatusForSearch;
    }
    if (searchLoginTerm) {
      filter['$or'].push({
        'accountData.login': {
          $regex: searchLoginTerm,
          $options: 'i',
        },
      });
    }

    if (searchEmailTerm) {
      filter['$or'].push({
        'accountData.email': {
          $regex: searchEmailTerm,
          $options: 'i',
        },
      });
    }
    if (!searchLoginTerm && !searchEmailTerm && !banStatus) {
      filter = {};
    }
    if (!searchLoginTerm && !searchEmailTerm && banStatus) {
      filter = { 'banInformation.isBanned': banStatusForSearch };
    }
    return filter;
  }

  async totalCountUsers(filter) {
    return this.userModel.countDocuments(filter);
  }

  async createUser(newUser: User) {
    await this.userModel.create(newUser);
    return newUser;
  }

  async findUserById(id: Types.ObjectId) {
    return this.userModel.findOne({ _id: id });
  }

  async updateUserBanStatus(
    userId: Types.ObjectId,
    inputData: InputBanUserDTO,
  ) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'banInformation.isBanned': inputData.isBanned,
          'banInformation.banReason': inputData.isBanned
            ? inputData.banReason
            : null,
          'banInformation.banDate': inputData.isBanned ? new Date() : null,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async deleteUser(id: Types.ObjectId) {
    const result = await this.userModel.deleteOne({
      _id: id,
    });
    return result.deletedCount === 1;
  }
}
