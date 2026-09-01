import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getRevenueReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getRevenueReport(startDate, endDate);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders report' })
  getOrdersReport() {
    return this.reportsService.getOrdersReport();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products report' })
  getProductsReport() {
    return this.reportsService.getProductsReport();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customers report' })
  getCustomersReport() {
    return this.reportsService.getCustomersReport();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export report as CSV' })
  exportCsv(@Query('type') type: string) {
    return this.reportsService.exportCsv(type);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  exportPdf(@Query('type') type: string) {
    return this.reportsService.exportPdf(type);
  }
}

