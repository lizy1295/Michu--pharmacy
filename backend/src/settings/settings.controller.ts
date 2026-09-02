import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService, BusinessSettings } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

import { UpsertSettingDto, UpdateSettingValueDto } from './dto/upsert-setting.dto';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Public endpoint — no auth required — returns only emergency_phone and contact_phones */
  @Get('public')
  @ApiOperation({ summary: 'Get public-facing phone settings (no auth required)' })
  async getPublicSettings() {
    const [emergency, contacts] = await Promise.all([
      this.settingsService.findOne('emergency_phone').catch(() => ({ value: '456' })),
      this.settingsService.findOne('contact_phones').catch(() => ({ value: '0904040364,0931325959' })),
    ]);
    return {
      emergencyPhone: emergency.value as string,
      contactPhones: (contacts.value as string).split(',').map((p: string) => p.trim()).filter(Boolean),
    };
  }

  /** Public endpoint — no auth required — returns emergency_phone setting */
  @Get('emergency-phone')
  @ApiOperation({ summary: 'Get emergency phone number (no auth required)' })
  async getEmergencyPhone() {
    const setting = await this.settingsService.findOne('emergency_phone').catch(() => ({ value: '456' }));
    return {
      emergencyPhone: setting.value as string,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get settings by category' })
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business settings' })
  getBusinessSettings() {
    return this.settingsService.getBusinessSettings();
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get setting by key' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update setting' })
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }

  @Patch('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business settings' })
  updateBusinessSettings(@Body() data: UpdateBusinessSettingsDto) {
    return this.settingsService.updateBusinessSettings(data);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update setting' })
  update(@Param('key') key: string, @Body() dto: UpdateSettingValueDto) {
    return this.settingsService.update(key, dto);
  }
}
