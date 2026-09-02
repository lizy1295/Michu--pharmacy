import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminsModule } from './admins/admins.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { ArticlesModule } from './articles/articles.module';
import { VideosModule } from './videos/videos.module';
import { BranchesModule } from './branches/branches.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentsModule } from './payments/payments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { TypeOrmConfigService } from './common/database/typeorm.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    PrescriptionsModule,
    LoyaltyModule,
    InventoryModule,
    NotificationsModule,
    AdminsModule,
    DashboardModule,
    CategoriesModule,
    CustomersModule,
    AdvertisementsModule,
    ArticlesModule,
    VideosModule,
    BranchesModule,
    ReportsModule,
    SettingsModule,
    DoctorsModule,
    InquiriesModule,
  ],
})
export class AppModule {}
