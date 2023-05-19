import { Injectable } from '@nestjs/common';
import { Devices } from './applications/devices.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { parse as uuidParse } from 'uuid';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllUserDevices(currentUserId: string) {
    return this.dataSource.query(
      `
      SELECT * FROM "devices"
      WHERE "userId" = $1
      `,
      [currentUserId],
    );
  }

  async findDeviceByDateAndUserId(issueAt: number, userId: string) {
    return this.dataSource.query(
      `
      SELECT * FROM "devices"
      WHERE "issueAt" = $1 AND "userId" = $2
      `,
      [issueAt, userId],
    );
  }

  async findDeviceByDeviceId(deviceId: string) {
    return this.dataSource.query(
      `
      SELECT * FROM "devices"
      WHERE "id" = $1
      `,
      [deviceId],
    );
  }

  async insertDeviceInfo(device: Devices) {
    await this.dataSource.query(
      `
      INSERT INTO "devices"
      VALUES ($1::uuid, $2, $3, $4::uuid, $5, $6);
      `,
      [
        device.id,
        device.ipAddress,
        device.deviceName,
        device.userId,
        device.issueAt,
        device.expiresAt,
      ],
    );
    return device;
  }

  async updateDeviceInfo(
    oldIssueAt: number,
    userId: string,
    newIssueAt: number,
  ) {
    const result = await this.dataSource.query(
      `
      UPDATE "devices"
      SET "issueAt" = $1
      WHERE "issueAt" = $2 AND "userId" = $3
      `,
      [newIssueAt, oldIssueAt, userId],
    );
    return result.matchedCount === 1;
  }

  async deleteAllDevicesExceptCurrent(issueAt: number, userId: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "devices"
      WHERE "issueAt" != $1 AND "userId" = $2
      `,
      [issueAt, userId],
    );
    return result.deletedCount === 1;
  }

  async deleteDevice(issueAt: number, userId: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "devices"
      WHERE "issueAt" = $1 AND "userId" = $2
      `,
      [issueAt, userId],
    );
    return result.deletedCount === 1;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      DELETE FROM "devices"
      WHERE "id" = $1
      `,
      [deviceId],
    );
    return result.deletedCount === 1;
  }
}
