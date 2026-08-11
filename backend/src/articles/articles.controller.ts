import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create article' })
  create(@Body() dto: any) {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.articlesService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(Number(id));
  }
}
