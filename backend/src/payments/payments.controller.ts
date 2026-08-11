import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PaymentsService, InitiatePaymentDto } from './payments.service';
import { PaymentProviderMethod } from './entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate Telebirr or CBE payment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'number', example: 1 },
        paymentMethod: { type: 'string', example: 'telebirr', enum: ['telebirr', 'cbe'] },
        returnUrl: { type: 'string', example: 'http://localhost:3000/cart' },
      },
      required: ['orderId', 'paymentMethod'],
    },
  })
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment details by Order ID' })
  findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(Number(orderId));
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify payment status with provider' })
  verify(@Param('id') id: string) {
    return this.paymentsService.verifyPayment(Number(id));
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Provider payment callback / webhook' })
  handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.paymentsService.handleWebhook(provider, body, headers);
  }
}
