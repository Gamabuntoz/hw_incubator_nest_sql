import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './applications/devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async findAllUserDevices(currentUserId: string) {
    return this.deviceModel.find({ userId: currentUserId });
  }
  async findDeviceByDateAndUserId(issueAt: number, userId: string) {
    return this.deviceModel.findOne({ issueAt: issueAt, userId: userId });
  }
  async findDeviceByDeviceId(deviceId: string) {
    return this.deviceModel.findOne({ deviceId: deviceId });
  }
  async insertDeviceInfo(device: Device) {
    await this.deviceModel.create(device);
    return device;
  }

  async updateDeviceInfo(
    oldIssueAt: number,
    userId: string,
    newIssueAt: number,
  ) {
    const deviceInstance = await this.deviceModel.findOne({
      issueAt: oldIssueAt,
      userId: userId,
    });
    deviceInstance.issueAt = newIssueAt;
    await deviceInstance.save();
    return true;
  }

  async deleteAllDevicesExceptCurrent(issueAt: number, userId: string) {
    await this.deviceModel.deleteMany({
      issueAt: { $ne: issueAt },
      userId: userId,
    });
    return true;
  }

  async deleteDevice(issueAt: number, userId: string) {
    const result = await this.deviceModel.deleteOne({
      issueAt: issueAt,
      userId: userId,
    });
    return result.deletedCount === 1;
  }
  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({ deviceId: deviceId });
    return result.deletedCount === 1;
  }
}
