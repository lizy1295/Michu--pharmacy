import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get inventory overview' })
  getOverview() {
    return this.inventoryService.getOverview();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired medicines' })
  getExpired() {
    return this.inventoryService.getExpired();
  }

  @Get('incoming')
  @ApiOperation({ summary: 'Get incoming inventory' })
  getIncoming() {
    return this.inventoryService.getIncoming();
  }
}

