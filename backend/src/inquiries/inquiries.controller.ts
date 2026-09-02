import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ReplyInquiryDto } from './dto/reply-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { STAFF_ROLES } from '@michu/shared';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit customer question / inquiry (Public)' })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all customer inquiries (Staff)' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'answered'] })
  findAll(@Query('status') status?: string) {
    return this.inquiriesService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inquiry details by ID (Staff)' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(Number(id));
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Staff reply to customer inquiry' })
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyInquiryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const staffName = user?.email ? user.email.split('@')[0] : 'Staff Pharmacist';
    return this.inquiriesService.reply(Number(id), dto, staffName);
  }
}
