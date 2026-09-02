import { Injectable, NotFoundException } from '@nestjs/common';
import { SEED_BRANCHES, BranchSeedData } from './data/branches.seed';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

export interface BranchResponse extends BranchSeedData {
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class BranchesService {
  private branches: BranchResponse[] = SEED_BRANCHES.map(b => ({
    ...b,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }));

  async findAll(): Promise<BranchResponse[]> {
    return this.branches;
  }

  async findOne(id: number): Promise<BranchResponse> {
    const branch = this.branches.find(b => b.id === id);
    if (!branch) throw new NotFoundException(`Branch with id ${id} not found`);
    return branch;
  }

  async create(dto: CreateBranchDto): Promise<BranchResponse> {
    const newBranch: BranchResponse = {
      id: this.branches.length + 1,
      name: dto.name,
      code: dto.code || `BR-${this.branches.length + 1}`,
      city: dto.city || 'Addis Ababa',
      location: dto.location,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      manager: dto.manager,
      openingHours: dto.openingHours,
      latitude: dto.latitude || 0,
      longitude: dto.longitude || 0,
      isPlaceholderCoords: dto.isPlaceholderCoords !== undefined ? dto.isPlaceholderCoords : true,
      status: dto.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<BranchResponse> {
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
