import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { InitialSchema1725440000000 } from '../../migrations/1725440000000-InitialSchema';
import { AddCertificationsToDoctor1725450000000 } from '../../migrations/1725450000000-AddCertificationsToDoctor';
import { AddUserIdToPayments1757000000000 } from '../../migrations/1757000000000-AddUserIdToPayments';
import { CreateReceiptsTable1757100000000 } from '../../migrations/1757100000000-CreateReceiptsTable';
import { CreatePasswordResetTokens1757200000000 } from '../../migrations/1757200000000-CreatePasswordResetTokens';
import { UpgradePasswordResetToOtp1757300000000 } from '../../migrations/1757300000000-UpgradePasswordResetToOtp';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbType = this.configService.get<string>('DB_TYPE', 'sqlite');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const shared: Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'synchronize' | 'logging' | 'migrations' | 'migrationsRun'> = {
      autoLoadEntities: true,
      synchronize: false,
      logging: !isProduction,
      migrations: [
        InitialSchema1725440000000,
        AddCertificationsToDoctor1725450000000,
        AddUserIdToPayments1757000000000,
        CreateReceiptsTable1757100000000,
        CreatePasswordResetTokens1757200000000,
        UpgradePasswordResetToOtp1757300000000,
      ],
      migrationsRun: true,
    };

    if (dbType === 'postgres') {
      const databaseUrl = this.configService.get<string>('DATABASE_URL');
      const useSsl = this.configService.get<string>('DB_SSL') === 'true';
      return {
        ...shared,
        type: 'postgres',
        ...(databaseUrl
          ? { url: databaseUrl }
          : {
              host: this.configService.get<string>('DB_HOST', 'localhost'),
              port: Number(this.configService.get<string | number>('DB_PORT', 5432)),
              username: this.configService.get<string>('DB_USERNAME', 'postgres'),
              password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
              database: this.configService.get<string>('DB_NAME', 'MPH'),
            }),
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      };
    }

    return {
      ...shared,
      type: 'better-sqlite3',
      database: this.configService.get<string>('SQLITE_PATH', './data/michu-dev.sqlite'),
    };
  }
}
