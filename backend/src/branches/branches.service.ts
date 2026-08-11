import { Injectable, NotFoundException } from '@nestjs/common';

export interface BranchResponse {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class BranchesService {
  private branches: BranchResponse[] = [
    { id: 1, name: 'Bole Branch', location: 'Bole, Addis Ababa', address: 'Bole Road, Near Bole Medhanialem', phone: '+251-11-123-4567', email: 'bole@michupharmacy.com', manager: 'Mr. Kebede', openingHours: '8:00 AM - 10:00 PM', latitude: 9.02, longitude: 38.75, status: 'active', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
  ];

  async findAll(): Promise<BranchResponse[]> {
    return this.branches;
  }

  async findOne(id: number): Promise<BranchResponse> {
    const branch = this.branches.find(b => b.id === id);
    if (!branch) throw new NotFoundException(`Branch with id ${id} not found`);
    return branch;
  }

  async create(dto: any): Promise<BranchResponse> {
    const newBranch: BranchResponse = {
      id: this.branches.length + 1,
      name: dto.name,
      location: dto.location,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      manager: dto.manager,
      openingHours: dto.openingHours,
      latitude: dto.latitude || 0,
      longitude: dto.longitude || 0,
      status: dto.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  async update(id: number, dto: any): Promise<BranchResponse> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    branch.updatedAt = new Date().toISOString();
    return branch;
  }

  async remove(id: number): Promise<{ message: string }> {
    const branch = await this.findOne(id);
    this.branches = this.branches.filter(b => b.id !== id);
    return { message: `Branch "${branch.name}" deleted` };
  }
}
