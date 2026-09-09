import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { isStaffRole } from '@michu/shared';

@ApiTags('Receipts')
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  /**
   * GET /receipts/order/:orderId
   * Exposes digital receipt to customer or staff.
   */
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get receipt by Order ID' })
  async findByOrderId(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const receipt = await this.receiptsService.findByOrderId(Number(orderId));
    if (!receipt) {
      throw new NotFoundException(`Receipt for order ${orderId} not found`);
    }

    // Ownership check for customers
    if (!isStaffRole(user.role)) {
      const isOwner =
        (receipt.order?.customerId && Number(receipt.order.customerId) === Number(user.sub)) ||
        (receipt.customerEmail && receipt.customerEmail.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        throw new ForbiddenException('You are not authorized to view this receipt.');
      }
    }

    return receipt;
  }

  /**
   * GET /receipts/:receiptNumber
   */
  @Get(':receiptNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get receipt by receipt number' })
  async findByReceiptNumber(
    @Param('receiptNumber') receiptNumber: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const receipt = await this.receiptsService.findByReceiptNumber(receiptNumber);

    // Ownership check for customers
    if (!isStaffRole(user.role)) {
      const isOwner =
        (receipt.order?.customerId && Number(receipt.order.customerId) === Number(user.sub)) ||
        (receipt.customerEmail && receipt.customerEmail.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        throw new ForbiddenException('You are not authorized to view this receipt.');
      }
    }

    return receipt;
  }
}
