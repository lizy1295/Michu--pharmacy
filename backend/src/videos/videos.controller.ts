import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create video' })
  create(@Body() dto: CreateVideoDto) {
    return this.videosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video' })
  update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    return this.videosService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(Number(id));
  }
}

