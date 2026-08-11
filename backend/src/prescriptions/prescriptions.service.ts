import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';

export class CreatePrescriptionDto {
  patientName!: string;
  patientEmail!: string;
  doctorName?: string;
  doctorLicense?: string;
  imageUrl!: string;
  notes?: string;
}

export class UpdatePrescriptionStatusDto {
  status!: PrescriptionStatus;
  notes?: string;
}

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
      patientName: dto.patientName,
      patientEmail: dto.patientEmail,
      doctorName: dto.doctorName,
      doctorLicense: dto.doctorLicense,
      imageUrl: dto.imageUrl || '',
      status: PrescriptionStatus.PENDING,
      notes: dto.notes,
    });

    return this.prescriptionRepo.save(prescription);
  }

  async updateStatus(id: number, dto: UpdatePrescriptionStatusDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.status = dto.status;
    if (dto.notes !== undefined) {
      prescription.notes = dto.notes;
    }
    return this.prescriptionRepo.save(prescription);
  }
}
