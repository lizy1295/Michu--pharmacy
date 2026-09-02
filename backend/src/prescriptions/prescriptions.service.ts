import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionStatusDto } from './dto/update-prescription-status.dto';
import { sanitizeText } from '../common/utils/sanitize.util';

export { CreatePrescriptionDto, UpdatePrescriptionStatusDto };

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
  ) {}

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({ where: { id } });
    if (!prescription) throw new NotFoundException(`Prescription with id ${id} not found`);
    return prescription;
  }

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const count = await this.prescriptionRepo.count();
    const prescriptionNumber = `RX-${String(count + 1).padStart(4, '0')}`;

    const prescription = this.prescriptionRepo.create({
      prescriptionNumber,
      patientName: sanitizeText(dto.patientName),
      patientEmail: dto.patientEmail,
      doctorName: dto.doctorName ? sanitizeText(dto.doctorName) : undefined,
      doctorLicense: dto.doctorLicense ? sanitizeText(dto.doctorLicense) : undefined,
      imageUrl: dto.imageUrl || '',
      status: PrescriptionStatus.PENDING,
      notes: dto.notes ? sanitizeText(dto.notes) : undefined,
    });

    return this.prescriptionRepo.save(prescription);
  }

  async updateStatus(id: number, dto: UpdatePrescriptionStatusDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.status = dto.status;
    if (dto.notes !== undefined) {
      prescription.notes = sanitizeText(dto.notes);
    }
    return this.prescriptionRepo.save(prescription);
  }
}
