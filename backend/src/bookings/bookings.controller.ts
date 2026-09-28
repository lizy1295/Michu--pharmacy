import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/bookings.dto';
import { BookingStatus } from './entities/booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { STAFF_ROLES } from '@michu/shared';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Customer submits a consultation booking request.
   * customerId, customerName, and customerEmail are read from the verified JWT.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a consultation booking (authenticated customers)' })
  @ApiBody({ type: CreateBookingDto })
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: JwtPayload) {
    return this.bookingsService.create(dto, user);
  }

  /**
   * Admin / staff — list all bookings with optional filters and pagination.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiOperation({ summary: 'List all bookings (staff)' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: BookingStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingsService.findAll(
      status,
      search,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  /**
   * Customer retrieves their own bookings.
   * Must be placed before `:id` to avoid route shadowing.
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the authenticated customer's own bookings" })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findByCustomer(Number(user.sub));
  }

  /**
   * Get a single booking by ID.
   * Staff can access any booking; customers see only their own (403 otherwise).
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a booking by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.bookingsService.findOne(id, user);
  }

  /**
   * Admin / staff — update a booking's status.
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiOperation({ summary: 'Update booking status (staff)' })
  @ApiBody({ type: UpdateBookingStatusDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
