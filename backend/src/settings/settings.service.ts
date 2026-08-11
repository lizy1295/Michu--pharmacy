import { Injectable, NotFoundException } from '@nestjs/common';

export interface SettingResponse {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'email' | 'payment' | 'delivery' | 'theme' | 'business';
  description?: string;
  updatedAt: string;
}

export interface BusinessSettings {
  websiteName: string;
  logo?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  currency: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    twitter?: string;
  };
  businessHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
}

@Injectable()
export class SettingsService {
  private settings: Map<string, SettingResponse> = new Map([
    ['website_name', { key: 'website_name', value: 'Michu Pharmacy', type: 'string', category: 'general', description: 'Website name', updatedAt: new Date().toISOString() }],
    ['logo', { key: 'logo', value: '', type: 'string', category: 'general', description: 'Logo URL', updatedAt: new Date().toISOString() }],
    ['contact_email', { key: 'contact_email', value: 'info@michupharmacy.com', type: 'string', category: 'general', description: 'Contact email', updatedAt: new Date().toISOString() }],
    ['contact_phone', { key: 'contact_phone', value: '+251-11-123-4567', type: 'string', category: 'general', description: 'Contact phone', updatedAt: new Date().toISOString() }],
    ['address', { key: 'address', value: 'Bole Road, Addis Ababa, Ethiopia', type: 'string', category: 'general', description: 'Business address', updatedAt: new Date().toISOString() }],
    ['currency', { key: 'currency', value: 'ETB', type: 'string', category: 'general', description: 'Currency code', updatedAt: new Date().toISOString() }],
    ['email_provider', { key: 'email_provider', value: 'smtp', type: 'string', category: 'email', description: 'Email provider', updatedAt: new Date().toISOString() }],
    ['payment_gateway', { key: 'payment_gateway', value: 'chapa', type: 'string', category: 'payment', description: 'Payment gateway', updatedAt: new Date().toISOString() }],
    ['delivery_fee', { key: 'delivery_fee', value: 50, type: 'number', category: 'delivery', description: 'Default delivery fee', updatedAt: new Date().toISOString() }],
    ['free_delivery_threshold', { key: 'free_delivery_threshold', value: 500, type: 'number', category: 'delivery', description: 'Free delivery minimum order', updatedAt: new Date().toISOString() }],
    ['dark_mode', { key: 'dark_mode', value: false, type: 'boolean', category: 'theme', description: 'Enable dark mode', updatedAt: new Date().toISOString() }],
    ['business_hours', { key: 'business_hours', value: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '10:00', close: '20:00' },
    }, type: 'json', category: 'business', description: 'Business operating hours', updatedAt: new Date().toISOString() }],
    ['social_media', { key: 'social_media', value: {
      facebook: 'https://facebook.com/michupharmacy',
      instagram: 'https://instagram.com/michupharmacy',
      telegram: 'https://t.me/michupharmacy',
      twitter: '',
    }, type: 'json', category: 'business', description: 'Social media links', updatedAt: new Date().toISOString() }],
  ]);

  async findAll(): Promise<SettingResponse[]> {
    return Array.from(this.settings.values());
  }

  async findOne(key: string): Promise<SettingResponse> {
    const setting = this.settings.get(key);
    if (!setting) throw new NotFoundException(`Setting with key ${key} not found`);
    return setting;
  }

  async findByCategory(category: string): Promise<SettingResponse[]> {
    return Array.from(this.settings.values()).filter(s => s.category === category);
  }

  async getBusinessSettings(): Promise<BusinessSettings> {
    const websiteName = this.settings.get('website_name')?.value as string || 'Michu Pharmacy';
    const logo = this.settings.get('logo')?.value as string || '';
    const contactEmail = this.settings.get('contact_email')?.value as string || '';
    const contactPhone = this.settings.get('contact_phone')?.value as string || '';
    const address = this.settings.get('address')?.value as string || '';
    const deliveryFee = this.settings.get('delivery_fee')?.value as number || 50;
    const freeDeliveryThreshold = this.settings.get('free_delivery_threshold')?.value as number || 500;
    const currency = this.settings.get('currency')?.value as string || 'ETB';
    const socialMedia = this.settings.get('social_media')?.value as BusinessSettings['socialMedia'] || {};
    const businessHours = this.settings.get('business_hours')?.value as BusinessSettings['businessHours'] || {};

    return {
      websiteName,
      logo,
      contactEmail,
      contactPhone,
      address,
      deliveryFee,
      freeDeliveryThreshold,
      currency,
      socialMedia,
      businessHours,
    };
  }

  async updateBusinessSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const updates: { key: string; value: any }[] = [];

    if (data.websiteName !== undefined) updates.push({ key: 'website_name', value: data.websiteName });
    if (data.logo !== undefined) updates.push({ key: 'logo', value: data.logo });
    if (data.contactEmail !== undefined) updates.push({ key: 'contact_email', value: data.contactEmail });
    if (data.contactPhone !== undefined) updates.push({ key: 'contact_phone', value: data.contactPhone });
    if (data.address !== undefined) updates.push({ key: 'address', value: data.address });
    if (data.deliveryFee !== undefined) updates.push({ key: 'delivery_fee', value: data.deliveryFee });
    if (data.freeDeliveryThreshold !== undefined) updates.push({ key: 'free_delivery_threshold', value: data.freeDeliveryThreshold });
    if (data.currency !== undefined) updates.push({ key: 'currency', value: data.currency });
    if (data.socialMedia !== undefined) updates.push({ key: 'social_media', value: data.socialMedia });
    if (data.businessHours !== undefined) updates.push({ key: 'business_hours', value: data.businessHours });

    for (const update of updates) {
      const existing = this.settings.get(update.key);
      if (existing) {
        existing.value = update.value;
        existing.updatedAt = new Date().toISOString();
        this.settings.set(update.key, existing);
      }
    }

    return this.getBusinessSettings();
  }

  async update(key: string, dto: { value: any }): Promise<SettingResponse> {
    const setting = await this.findOne(key);
    setting.value = dto.value;
    setting.updatedAt = new Date().toISOString();
    this.settings.set(key, setting);
    return setting;
  }

  async upsert(dto: { key: string; value: any; type?: string; category?: string; description?: string }): Promise<SettingResponse> {
    const existing = this.settings.get(dto.key);
    if (existing) {
      existing.value = dto.value;
      existing.updatedAt = new Date().toISOString();
      this.settings.set(dto.key, existing);
      return existing;
    }
    const newSetting: SettingResponse = {
      key: dto.key,
      value: dto.value,
      type: (dto.type as any) || 'string',
      category: (dto.category as any) || 'general',
      description: dto.description,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(dto.key, newSetting);
    return newSetting;
  }
}
