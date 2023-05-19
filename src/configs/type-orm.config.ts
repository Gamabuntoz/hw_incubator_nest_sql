import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Users } from '../super_admin/sa_users/applications/users.entity';
import { Devices } from '../public/devices/applications/devices.entity';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DB_URL'),
      autoLoadEntities: true,
      entities: [Users, Devices],
      synchronize: true,
    };
  }
}
