import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { Admin } from './entities/admin.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService, TypeOrmModule],
})
export class AdminsModule {}

