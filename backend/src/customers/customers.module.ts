import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
