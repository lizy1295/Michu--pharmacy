import { Injectable, NotFoundException } from '@nestjs/common';

export interface CustomerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

@Injectable()
export class CustomersService {
  private customers: CustomerResponse[] = [
    { id: 1, name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251911000001', address: 'Addis Ababa, Bole', totalOrders: 12, totalSpent: 15600, status: 'active', createdAt: '2026-07-20T10:00:00Z' },
    { id: 2, name: 'Sara Tesfaye', email: 'sara@example.com', phone: '+251911000002', address: 'Addis Ababa, Kirkos', totalOrders: 8, totalSpent: 9200, status: 'active', createdAt: '2026-07-22T14:00:00Z' },
    { id: 3, name: 'Dawit Hailu', email: 'dawit@example.com', phone: '+251911000003', address: 'Addis Ababa, Lideta', totalOrders: 5, totalSpent: 4500, status: 'inactive', createdAt: '2026-07-25T09:00:00Z' },
  ];

  async findAll(): Promise<CustomerResponse[]> {
    return this.customers;
  }

  async findOne(id: number): Promise<CustomerResponse> {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) throw new NotFoundException(`Customer with id ${id} not found`);
    return customer;
  }

  async create(dto: any): Promise<CustomerResponse> {
    const newCustomer: CustomerResponse = {
      id: this.customers.length + 1,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address || '',
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async update(id: number, dto: any): Promise<CustomerResponse> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return customer;
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    this.customers = this.customers.filter(c => c.id !== id);
    return { message: `Customer "${customer.name}" deleted` };
  }
}
