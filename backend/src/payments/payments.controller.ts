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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { PaymentsService, InitiatePaymentDto } from './payments.service';
import { PaymentProviderMethod } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

const PAYMENT_PROOF_DIR = './uploads/payments';
if (!existsSync(PAYMENT_PROOF_DIR)) {
  mkdirSync(PAYMENT_PROOF_DIR, { recursive: true });
}

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

  /**
   * Upload customer receipt screenshot or payment proof
   */
  @Post('upload-proof')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload customer payment receipt screenshot' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: PAYMENT_PROOF_DIR,
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `proof-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadPaymentProof(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No payment proof file was uploaded.');
    }

    return {
      message: 'Payment proof uploaded successfully',
      url: `/uploads/payments/${file.filename}`,
      filename: file.filename,
    };
  }

  /**
   * Submit payment proof (Transaction ID + receipt screenshot)
   */
  @Post('submit-proof')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit payment transaction ID and receipt screenshot for approval' })
  submitProof(
    @Body()
    dto: {
      orderId: number;
      paymentMethod: string;
      transactionId?: string;
      proofImage?: string;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = Number(user.sub);
    return this.paymentsService.submitPaymentProof({
      ...dto,
      userId,
    });
  }

  /**
   * Admin approves verified payment and issues digital receipt
   */
  @Post('order/:orderId/admin-approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin approve payment after checking statement' })
  adminApprove(@Param('orderId') orderId: string) {
    return this.paymentsService.adminApprovePayment(Number(orderId));
  }

  /**
   * Admin rejects payment proof
   */
  @Post('order/:orderId/admin-reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reject payment proof' })
  adminReject(@Param('orderId') orderId: string, @Body() body: { reason?: string }) {
    return this.paymentsService.adminRejectPayment(Number(orderId), body?.reason);
  }
}

