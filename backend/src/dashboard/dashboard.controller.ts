import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue data' })
  @ApiQuery({ name: 'period', required: false, type: String })
  getRevenue(@Query('period') period?: string) {
    return this.dashboardService.getRevenue(period);
  }

  @Get('orders-chart')
  @ApiOperation({ summary: 'Get orders chart data' })
  getOrdersChart() {
    return this.dashboardService.getOrdersChart();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentOrders(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentOrders(limit ? Number(limit) : 10);
  }

  @Get('recent-customers')
  @ApiOperation({ summary: 'Get recent customers' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentCustomers(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentCustomers(limit ? Number(limit) : 10);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopProducts(@Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(limit ? Number(limit) : 10);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getActivities(@Query('limit') limit?: string) {
    return this.dashboardService.getActivities(limit ? Number(limit) : 20);
  }
}

