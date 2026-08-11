import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VideosService } from './videos.service';

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
  @ApiOperation({ summary: 'Create video' })
  create(@Body() dto: any) {
    return this.videosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update video' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.videosService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete video' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(Number(id));
  }
}
