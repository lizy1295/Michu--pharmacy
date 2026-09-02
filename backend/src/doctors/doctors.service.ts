import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { sanitizeText } from '../common/utils/sanitize.util';

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

  async create(data: CreateDoctorDto) {
    if (!data.firstName || !data.lastName || !data.specialization || !data.contactEmail) {
      throw new BadRequestException('Missing required fields');
    }
    const doctor = this.doctorsRepo.create({
      ...data,
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      specialization: sanitizeText(data.specialization),
      contactPhone: data.contactPhone ? sanitizeText(data.contactPhone) : undefined,
      bio: data.bio ? sanitizeText(data.bio) : undefined,
    });
    return this.doctorsRepo.save(doctor);
  }

  async update(id: number, data: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    const updatePayload: Partial<Doctor> = {
      ...data,
    };
    if (data.firstName !== undefined) updatePayload.firstName = sanitizeText(data.firstName);
    if (data.lastName !== undefined) updatePayload.lastName = sanitizeText(data.lastName);
    if (data.specialization !== undefined) updatePayload.specialization = sanitizeText(data.specialization);
    if (data.contactPhone !== undefined) updatePayload.contactPhone = sanitizeText(data.contactPhone);
    if (data.bio !== undefined) updatePayload.bio = sanitizeText(data.bio);

    Object.assign(doctor, updatePayload);
    return this.doctorsRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    await this.doctorsRepo.remove(doctor);
    return { message: `Doctor ${doctor.firstName} ${doctor.lastName} deleted` };
  }
}
