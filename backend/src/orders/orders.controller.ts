import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { STAFF_ROLES, isStaffRole } from '@michu/shared';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(status as any, search, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer order history' })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  findByCustomer(
    @CurrentUser() user: JwtPayload,
    @Query('email') email?: string,
    @Query('customerId') customerId?: string,
  ) {
    if (!isStaffRole(user.role)) {
      return this.ordersService.findByCustomer(user.email ?? undefined, user.sub ? Number(user.sub) : undefined);
    }
    return this.ordersService.findByCustomer(email, customerId ? Number(customerId) : undefined);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const order = await this.ordersService.findOne(Number(id));
    if (!isStaffRole(user.role)) {
      const isOwner =
        (order.customerId && Number(order.customerId) === Number(user.sub)) ||
        (order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        throw new ForbiddenException('You are not authorized to view this order.');
      }
    }
    return order;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order' })
  @ApiBody({ type: CreateOrderDto })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    if (user && !isStaffRole(user.role)) {
      dto.customerId = Number(user.sub);
      if (user.email) {
        dto.customerEmail = user.email;
      }
    }
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiBody({ type: UpdateOrderStatusDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(Number(id), dto);
  }
}

