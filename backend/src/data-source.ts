import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const dbType = process.env.DB_TYPE || 'sqlite';

export const dataSourceOptions: DataSourceOptions =
  dbType === 'postgres'
    ? {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '1234567uiui',
        database: process.env.DB_NAME || 'MPH',
        entities: [join(__dirname, '/**/*.entity.{ts,js}')],
        migrations: [join(__dirname, '/migrations/*.{ts,js}')],
        synchronize: false,
        logging: true,
      }
    : {
        type: 'better-sqlite3',
        database: process.env.SQLITE_PATH || './data/michu-dev.sqlite',
        entities: [join(__dirname, '/**/*.entity.{ts,js}')],
        migrations: [join(__dirname, '/migrations/*.{ts,js}')],
        synchronize: false,
        logging: true,
      };

export const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
