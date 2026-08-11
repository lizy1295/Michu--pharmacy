import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';

@ApiTags('Advertisements')
@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all advertisements' })
  findAll() {
    return this.advertisementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by ID' })
  findOne(@Param('id') id: string) {
    return this.advertisementsService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create advertisement' })
  create(@Body() dto: any) {
    return this.advertisementsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update advertisement' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.advertisementsService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete advertisement' })
  remove(@Param('id') id: string) {
    return this.advertisementsService.remove(Number(id));
  }
}
