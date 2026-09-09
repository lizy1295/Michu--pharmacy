import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/product.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TelebirrService } from './services/telebirr.service';
import { CbeService } from './services/cbe.service';
import { ChapaService } from './services/chapa.service';
import { OrdersModule } from '../orders/orders.module';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Product]),
    OrdersModule,
    ReceiptsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, TelebirrService, CbeService, ChapaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
