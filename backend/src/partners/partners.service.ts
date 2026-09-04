import { Injectable, NotFoundException } from '@nestjs/common';

export interface PartnerResponse {
  id: number;
  name: string;
  category: 'manufacturer' | 'regulatory' | 'fintech' | 'health_system';
  badge: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export class CreatePartnerDto {
  name!: string;
  category?: 'manufacturer' | 'regulatory' | 'fintech' | 'health_system';
  badge?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export class UpdatePartnerDto {
  name?: string;
  category?: 'manufacturer' | 'regulatory' | 'fintech' | 'health_system';
  badge?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

const SEED_PARTNERS: PartnerResponse[] = [
  {
    id: 1,
    name: 'EFDA',
    category: 'regulatory',
    badge: 'Federal Regulatory Authority',
    description: 'Ethiopian Food and Drug Authority — National safety, standard, and licensing accreditation.',
    websiteUrl: 'https://efda.gov.et',
    displayOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'EPSA',
    category: 'regulatory',
    badge: 'National Supply Partner',
    description: 'Ethiopian Pharmaceuticals Supply Agency — Ensuring sustainable public medicine supply.',
    websiteUrl: 'https://epsa.gov.et',
    displayOrder: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'EPHARM',
    category: 'manufacturer',
    badge: 'National Leader',
    description: 'Ethiopian Pharmaceuticals Manufacturing S.C. — Domestic pharmaceutical excellence.',
    websiteUrl: 'https://epharm.com.et',
    displayOrder: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Cadila Pharmaceuticals',
    category: 'manufacturer',
    badge: 'Certified WHO-GMP',
    description: 'Cadila Pharmaceuticals Ethiopia — State-of-the-art formulations and critical care medications.',
    websiteUrl: 'https://cadilapharma.com',
    displayOrder: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Julphar Pharmaceuticals',
    category: 'manufacturer',
    badge: 'Global Standard',
    description: 'Julphar Ethiopia — International grade therapeutics, antibiotics, and skin care formulations.',
    websiteUrl: 'https://julphar.net',
    displayOrder: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Addis Pharmaceuticals (APF)',
    category: 'manufacturer',
    badge: 'Trusted Generic',
    description: 'APF — High-potency generic medicines for cardiovascular and chronic management.',
    websiteUrl: 'https://apf.com.et',
    displayOrder: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'Telebirr',
    category: 'fintech',
    badge: 'Official Payment',
    description: 'Ethio Telecom SuperApp — Instant digital checkout, USSD, and zero-fee transactions.',
    websiteUrl: 'https://telebirr.et',
    displayOrder: 7,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Commercial Bank of Ethiopia',
    category: 'fintech',
    badge: 'Banking Gateway',
    description: 'CBE Birr & CBE direct gateway for secure in-branch and online medical payments.',
    websiteUrl: 'https://combanketh.et',
    displayOrder: 8,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable()
export class PartnersService {
  private partners: PartnerResponse[] = [...SEED_PARTNERS];

  async findAll(): Promise<PartnerResponse[]> {
    return this.partners.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async findOne(id: number): Promise<PartnerResponse> {
    const partner = this.partners.find(p => p.id === id);
    if (!partner) throw new NotFoundException(`Partner with id ${id} not found`);
    return partner;
  }

  async create(dto: CreatePartnerDto): Promise<PartnerResponse> {
    const newPartner: PartnerResponse = {
      id: this.partners.length > 0 ? Math.max(...this.partners.map(p => p.id)) + 1 : 1,
      name: dto.name,
      category: dto.category || 'manufacturer',
      badge: dto.badge || 'Verified Partner',
      description: dto.description || '',
      logoUrl: dto.logoUrl || '',
      websiteUrl: dto.websiteUrl || '',
      displayOrder: dto.displayOrder || this.partners.length + 1,
      status: dto.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.partners.push(newPartner);
    return newPartner;
  }

  async update(id: number, dto: UpdatePartnerDto): Promise<PartnerResponse> {
    const partner = await this.findOne(id);
    Object.assign(partner, dto);
    partner.updatedAt = new Date().toISOString();
    return partner;
  }

  async remove(id: number): Promise<{ message: string }> {
    const partner = await this.findOne(id);
    this.partners = this.partners.filter(p => p.id !== id);
    return { message: `Partner "${partner.name}" deleted` };
  }
}
