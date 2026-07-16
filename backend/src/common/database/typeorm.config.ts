import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbType = this.configService.get<string>('DB_TYPE', 'sqlite');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const shared: Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'synchronize' | 'logging'> = {
      autoLoadEntities: true,
      synchronize: !isProduction,
      logging: !isProduction,
    };

    if (dbType === 'postgres') {
      return {
        ...shared,
        type: 'postgres',
        host: this.configService.get<string>('DB_HOST', 'localhost'),
        port: this.configService.get<number>('DB_PORT', 5432),
        username: this.configService.get<string>('DB_USERNAME', 'postgres'),
        password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
        database: this.configService.get<string>('DB_NAME', 'MPH'),
      };
    }

    return {
      ...shared,
      type: 'better-sqlite3',
      database: this.configService.get<string>('SQLITE_PATH', './data/michu-dev.sqlite'),
    };
  }
}
