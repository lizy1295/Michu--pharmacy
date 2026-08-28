import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers (registered users with role=customer)' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics (total, active, new this month)' })
  getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiBody({ type: CreateCustomerDto })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer status or details' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.customersService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(Number(id));
  }
}
