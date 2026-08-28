import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepo: Repository<Doctor>,
  ) {}

  async findAll() {
    return this.doctorsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const doctor = await this.doctorsRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException(`Doctor with ID ${id} not found`);
    return doctor;
  }

  async create(data: Partial<Doctor>) {
    if (!data.firstName || !data.lastName || !data.specialization || !data.contactEmail) {
      throw new BadRequestException('Missing required fields');
    }
    const doctor = this.doctorsRepo.create(data);
    return this.doctorsRepo.save(doctor);
  }

  async update(id: number, data: Partial<Doctor>) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, data);
    return this.doctorsRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    await this.doctorsRepo.remove(doctor);
    return { message: `Doctor ${doctor.firstName} ${doctor.lastName} deleted` };
  }
}
