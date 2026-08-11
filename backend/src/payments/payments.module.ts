import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/product.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TelebirrService } from './services/telebirr.service';
import { CbeService } from './services/cbe.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Product]),
    OrdersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, TelebirrService, CbeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
