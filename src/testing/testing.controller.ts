import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
} from '../super_admin/sa_users/applications/users.schema';
import { Model } from 'mongoose';
import {
  Device,
  DeviceDocument,
} from '../public/devices/applications/devices.schema';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAllData() {
    {
    }
    await this.userModel.deleteMany({});
    await this.deviceModel.deleteMany({});
    return;
  }
}
