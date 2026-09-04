import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

export interface AdvertisementResponse {
  id: number;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  targetUrl: string;
  targetPage: string;
  position: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'expired';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AdvertisementsService {
  private advertisements: AdvertisementResponse[] = [
    {
      id: 1,
      title: 'Clinical Video Guide: Modern Respiratory & Asthma Management Protocol',
      description: 'Watch our clinical pharmacist team explain the 3-step preventive therapy for bronchial asthma, spacer usage, and when to seek instant nebulization at Michu branches.',
      mediaType: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      targetUrl: '/health?action=consult',
      targetPage: 'homepage',
      position: 'disease_solution',
      displayOrder: 1,
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      status: 'published',
      createdBy: 'Dr. Helen Tadesse (MD, BCPS)',
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Seasonal Alert: Modern Pediatric Respiratory & Asthma Relief Solutions',
      description: 'Comprehensive solutions for seasonal bronchial allergies and asthma flare-ups: portable nebulizers, spacer chambers, and pediatrician-verified syrups.',
      mediaType: 'image',
      mediaUrl: '',
      targetUrl: '/products?category=Medicine',
      targetPage: 'homepage',
      position: 'disease_solution',
      displayOrder: 2,
      startDate: '2026-08-10',
      endDate: '2026-12-31',
      status: 'published',
      createdBy: 'Admin / Health Team',
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-08-10T10:00:00Z',
    },
    {
      id: 3,
      title: 'Product Innovation: Smart Continuous Blood Glucose Monitoring Kits',
      description: 'Accurate instant readings with painless micro-sensors. Manage Type 1 and Type 2 diabetes with precision. Free battery replacement and lancets included.',
      mediaType: 'image',
      mediaUrl: '',
      targetUrl: '/products?category=Medical Devices',
      targetPage: 'homepage',
      position: 'product_news',
      displayOrder: 3,
      startDate: '2026-08-15',
      endDate: '2026-12-31',
      status: 'published',
      createdBy: 'Admin / Pharmacy Lead',
      createdAt: '2026-08-15T10:00:00Z',
      updatedAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 4,
      title: 'Special Promotion: Telebirr & CBE Birr Instant Checkout Discounts',
      description: 'Enjoy 10% instant rebate on verified OTC supplements and skincare lines when paying with Telebirr SuperApp or Commercial Bank of Ethiopia CBE Birr.',
      mediaType: 'image',
      mediaUrl: '',
      targetUrl: '/products',
      targetPage: 'homepage',
      position: 'hero_banner',
      displayOrder: 4,
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      status: 'published',
      createdBy: 'Admin / Finance',
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    },
  ];

  async findAll(): Promise<AdvertisementResponse[]> {
    return this.advertisements;
  }

  async findOne(id: number): Promise<AdvertisementResponse> {
    const ad = this.advertisements.find(a => a.id === id);
    if (!ad) throw new NotFoundException(`Advertisement with id ${id} not found`);
    return ad;
  }

  async create(dto: CreateAdvertisementDto): Promise<AdvertisementResponse> {
    const newAd: AdvertisementResponse = {
      id: this.advertisements.length > 0 ? Math.max(...this.advertisements.map(a => a.id)) + 1 : 1,
      title: dto.title,
      description: dto.description || '',
      mediaType: dto.mediaType || 'image',
      mediaUrl: dto.mediaUrl || '',
      thumbnailUrl: dto.thumbnailUrl,
      targetUrl: dto.targetUrl || '',
      targetPage: dto.targetPage || 'homepage',
      position: dto.position || 'disease_solution',
      displayOrder: dto.displayOrder || this.advertisements.length + 1,
      startDate: dto.startDate || new Date().toISOString().split('T')[0],
      endDate: dto.endDate || '',
      status: (dto.status as any) || 'published',
      createdBy: dto.createdBy || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.advertisements.push(newAd);
    return newAd;
  }

  async update(id: number, dto: UpdateAdvertisementDto): Promise<AdvertisementResponse> {
    const ad = await this.findOne(id);
    Object.assign(ad, dto);
    ad.updatedAt = new Date().toISOString();
    return ad;
  }

  async remove(id: number): Promise<{ message: string }> {
    const ad = await this.findOne(id);
    this.advertisements = this.advertisements.filter(a => a.id !== id);
    return { message: `Advertisement "${ad.title}" deleted` };
  }
}
