import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
} from '../../super_admin/sa_users/applications/users.schema';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(newUser: User) {
    await this.userModel.create(newUser);
    return newUser;
  }

  async findUserById(id: string) {
    return this.userModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async countBannedUsersInIdArray(ids: Types.ObjectId[]) {
    return this.userModel.countDocuments({
      _id: { $in: ids },
      'banInformation.isBanned': true,
    });
  }

  async allIdBannedUsers(ids: Types.ObjectId[]) {
    return this.userModel.find({
      _id: { $in: ids },
      'banInformation.isBanned': true,
    });
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserByRecoveryCode(code: string) {
    return this.userModel.findOne({ 'passwordRecovery.code': code });
  }

  async findUserByConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async updateConfirmation(id: string) {
    await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return true;
  }

  async setNewConfirmationCode(user: User): Promise<boolean> {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
      minutes: 1,
    });
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          'emailConfirmation.confirmationCode': newCode,
          'emailConfirmation.expirationDate': newDate,
        },
      },
    );
    return true;
  }

  async createPasswordRecoveryCode(id: string) {
    const code = uuidv4();
    const date = add(new Date(), {
      hours: 1,
      minutes: 1,
    });
    const userInstance = await this.findUserById(id);
    if (!userInstance) return false;
    userInstance.passwordRecovery.code = code;
    userInstance.passwordRecovery.expirationDate = date;
    await userInstance.save();
    return true;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!userInstance) return false;
    userInstance.accountData.passwordHash = passwordHash;
    await userInstance.save();
    return true;
  }
}
