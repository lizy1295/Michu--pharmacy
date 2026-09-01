import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService, BusinessSettings } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get('business')
  @ApiOperation({ summary: 'Get business settings' })
  getBusinessSettings() {
    return this.settingsService.getBusinessSettings();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update setting' })
  upsert(@Body() dto: any) {
    return this.settingsService.upsert(dto);
  }

  @Patch('business')
  @ApiOperation({ summary: 'Update business settings' })
  updateBusinessSettings(@Body() data: Partial<BusinessSettings>) {
    return this.settingsService.updateBusinessSettings(data);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update setting' })
  update(@Param('key') key: string, @Body() dto: { value: any }) {
    return this.settingsService.update(key, dto);
  }
}

