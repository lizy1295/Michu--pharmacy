import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from './entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ReplyInquiryDto } from './dto/reply-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiriesRepo: Repository<Inquiry>,
  ) {}

  async create(dto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = this.inquiriesRepo.create({
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone ?? undefined,
      message: dto.message,
      status: InquiryStatus.OPEN,
    });
    return this.inquiriesRepo.save(inquiry);
  }

  async findAll(status?: string): Promise<Inquiry[]> {
    const query = this.inquiriesRepo.createQueryBuilder('inquiry');
    if (status && (status === InquiryStatus.OPEN || status === InquiryStatus.ANSWERED)) {
      query.where('inquiry.status = :status', { status });
    }
    query.orderBy('inquiry.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<Inquiry> {
    const inquiry = await this.inquiriesRepo.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }
    return inquiry;
  }

  async reply(id: number, dto: ReplyInquiryDto, staffName?: string): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    inquiry.staffReply = dto.staffReply;
    inquiry.repliedBy = staffName || 'Pharmacist Staff';
    inquiry.repliedAt = new Date();
    inquiry.status = InquiryStatus.ANSWERED;
    return this.inquiriesRepo.save(inquiry);
  }
}
