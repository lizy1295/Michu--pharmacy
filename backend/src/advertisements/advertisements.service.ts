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
    { id: 1, title: 'Summer Sale', description: 'Up to 30% off on supplements', mediaType: 'image', mediaUrl: '/ads/summer-sale.jpg', targetUrl: '/products?category=Supplements', targetPage: 'homepage', position: 'hero_banner', displayOrder: 1, startDate: '2026-07-01', endDate: '2026-08-31', status: 'published', createdBy: 'Admin', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-01T10:00:00Z' },
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
      id: this.advertisements.length + 1,
      title: dto.title,
      description: dto.description || '',
      mediaType: dto.mediaType || 'image',
      mediaUrl: dto.mediaUrl || '',
      thumbnailUrl: dto.thumbnailUrl,
      targetUrl: dto.targetUrl || '',
      targetPage: dto.targetPage || '',
      position: dto.position || '',
      displayOrder: dto.displayOrder || 0,
      startDate: dto.startDate || '',
      endDate: dto.endDate || '',
      status: dto.status || 'draft',
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
