import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BranchesService } from './branches.service';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() dto: any) {
    return this.branchesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.branchesService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch' })
  remove(@Param('id') id: string) {
    return this.branchesService.remove(Number(id));
  }
}
