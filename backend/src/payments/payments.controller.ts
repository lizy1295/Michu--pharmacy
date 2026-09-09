import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, InitiatePaymentDto } from './payments.service';
import { PaymentProviderMethod } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/initialize  (Phase 2 — official endpoint)
   *
   * Request body: { orderId: number, paymentMethod: 'telebirr' | 'cbe' }
   * The authenticated user's ID is taken from the JWT — never from the request body.
   * The payment amount is read from the database — the frontend must NOT send it.
   */
  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a Chapa payment for an order (Phase 2)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'number', example: 1 },
        paymentMethod: {
          type: 'string',
          example: 'telebirr',
          enum: ['telebirr', 'cbe'],
          description: 'Payment method to use. Amount is read from the database — do NOT send amount.',
        },
      },
      required: ['orderId', 'paymentMethod'],
    },
  })
  initialize(@Body() dto: InitiatePaymentDto, @CurrentUser() user: JwtPayload) {
    const userId = Number(user.sub);
    return this.paymentsService.initiatePayment(dto, userId);
  }

  /**
   * POST /payments/initiate  (legacy alias — kept for backward compatibility)
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment (legacy alias — use /initialize instead)' })
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
  initiate(@Body() dto: InitiatePaymentDto, @CurrentUser() user: JwtPayload) {
    const userId = Number(user.sub);
    return this.paymentsService.initiatePayment(dto, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details by Order ID' })
  findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(Number(orderId));
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment status with provider' })
  verify(@Param('id') id: string) {
    return this.paymentsService.verifyPayment(Number(id));
  }

  /**
   * POST /payments/webhook/chapa (Phase 3 & Phase 4)
   *
   * Receives asynchronous payment event notifications from Chapa.
   * Verifies signature, calls Chapa verification API, updates payment/order to PAID,
   * creates immutable receipt, and returns HTTP 200.
   */
  @Post('webhook/chapa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Official Chapa payment webhook endpoint' })
  async handleChapaWebhook(@Body() body: any, @Headers() headers: any) {
    const result = await this.paymentsService.processChapaWebhook(body, headers);
    return result;
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provider payment callback / webhook' })
  handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.paymentsService.handleWebhook(provider, body, headers);
  }
}

