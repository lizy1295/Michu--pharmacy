import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { InitialSchema1725440000000 } from '../../migrations/1725440000000-InitialSchema';
import { AddCertificationsToDoctor1725450000000 } from '../../migrations/1725450000000-AddCertificationsToDoctor';
import { MakeEmailNullable1725550000000 } from '../../migrations/1725550000000-MakeEmailNullable';
import { AddUserIdToPayments1757000000000 } from '../../migrations/1757000000000-AddUserIdToPayments';
import { CreateReceiptsTable1757100000000 } from '../../migrations/1757100000000-CreateReceiptsTable';
import { CreatePasswordResetTokens1757200000000 } from '../../migrations/1757200000000-CreatePasswordResetTokens';
import { UpgradePasswordResetToOtp1757300000000 } from '../../migrations/1757300000000-UpgradePasswordResetToOtp';
import { CreateAdvertisementsTable1757400000000 } from '../../migrations/1757400000000-CreateAdvertisementsTable';
import { CreateOrderItemsTable1757500000000 } from '../../migrations/1757500000000-CreateOrderItemsTable';
import { InitialSchema1789966972055 } from '../../migrations/1789966972055-InitialSchema';
import { FixAdvertisementsColumnDrift1789970000000 } from '../../migrations/1789970000000-FixAdvertisementsColumnDrift';
import { RetireDuplicateOrderStorage1789971000000 } from '../../migrations/1789971000000-RetireDuplicateOrderStorage';
import { AddMissingAuditIndexes1789972000000 } from '../../migrations/1789972000000-AddMissingAuditIndexes';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbType = this.configService.get<string>('DB_TYPE', 'sqlite');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';
    const isStaging = nodeEnv === 'staging';
    const isLocal = !isProduction && !isStaging;

    // PostgreSQL shared config  includes migrations (postgres-specific SQL)
    const postgresShared: Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'synchronize' | 'logging' | 'migrations' | 'migrationsRun'> = {
      autoLoadEntities: true,
      synchronize: isLocal,
      logging: !isProduction,
      migrations: [
        InitialSchema1725440000000,
        AddCertificationsToDoctor1725450000000,
        MakeEmailNullable1725550000000,
        AddUserIdToPayments1757000000000,
        CreateReceiptsTable1757100000000,
        CreatePasswordResetTokens1757200000000,
        UpgradePasswordResetToOtp1757300000000,
        CreateAdvertisementsTable1757400000000,
        CreateOrderItemsTable1757500000000,
        InitialSchema1789966972055,
        FixAdvertisementsColumnDrift1789970000000,
        RetireDuplicateOrderStorage1789971000000,
        AddMissingAuditIndexes1789972000000,
      ],
      migrationsRun: true,
    };

    // SQLite shared config � disable migrations (they use postgres SQL), use synchronize instead
    const sqliteShared: Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'synchronize' | 'logging' | 'migrations' | 'migrationsRun'> = {
      autoLoadEntities: true,
      synchronize: isLocal,
      logging: !isProduction,
      migrations: [],
      migrationsRun: false,
    };

    if (dbType === 'postgres') {
      const databaseUrl = this.configService.get<string>('DATABASE_URL');
      const useSsl = this.configService.get<string>('DB_SSL') === 'true';
      return {
        ...postgresShared,
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
      ...sqliteShared,
      type: 'better-sqlite3',
      database: this.configService.get<string>('SQLITE_PATH', './data/michu-dev.sqlite'),
    };
  }
}
