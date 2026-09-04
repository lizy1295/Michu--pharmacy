import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { sanitizeText } from '../common/utils/sanitize.util';

const INITIAL_DOCTORS = [
  {
    firstName: 'Helen',
    lastName: 'Tadesse',
    specialization: 'Internal Medicine & Clinical Pharmacology',
    experienceYears: 12,
    contactEmail: 'dr.helen@michupharmacy.com',
    contactPhone: '+251 91 123 4567',
    bio: 'Senior consultant specializing in complex medication management, chronic illness pharmacotherapy, and adverse drug interaction prevention.',
    languages: ['Amharic', 'English'],
    certifications: [
      'EFDA Licensed Medical Practitioner',
      'MD - Addis Ababa University School of Medicine',
      'Board Certified Pharmacotherapy Specialist (BCPS)',
    ],
    status: 'active',
    availableForConsultation: true,
  },
  {
    firstName: 'Dawit',
    lastName: 'Abebe',
    specialization: 'Chief Clinical Pharmacist & Drug Safety',
    experienceYears: 10,
    contactEmail: 'dr.dawit@michupharmacy.com',
    contactPhone: '+251 92 234 5678',
    bio: 'Experienced clinical pharmacist overseeing hospital-grade prescription verification, dosage optimization, and patient drug counseling.',
    languages: ['Amharic', 'English', 'Oromiffa'],
    certifications: [
      'Doctor of Pharmacy (PharmD)',
      'MSc in Clinical Pharmacy & Toxicology',
      'Fellow of the Ethiopian Pharmaceutical Association',
    ],
    status: 'active',
    availableForConsultation: true,
  },
  {
    firstName: 'Selamawit',
    lastName: 'Girma',
    specialization: 'Consultant Pediatrician & Family Health',
    experienceYears: 9,
    contactEmail: 'dr.selamawit@michupharmacy.com',
    contactPhone: '+251 93 345 6789',
    bio: 'Dedicated pediatrician guiding infant medication safety, childhood nutritional supplementation, and respiratory infection management.',
    languages: ['Amharic', 'English', 'Tigrigna'],
    certifications: [
      'MD Pediatric Medicine',
      'EFDA Certified Clinical Care Specialist',
      'International Pediatric Association Certified',
    ],
    status: 'active',
    availableForConsultation: true,
  },
  {
    firstName: 'Yonas',
    lastName: 'Kassa',
    specialization: 'Senior Pharmacist & Chronic Care Consultant',
    experienceYears: 14,
    contactEmail: 'dr.yonas@michupharmacy.com',
    contactPhone: '+251 94 456 7890',
    bio: 'Specialist in diabetes care, hypertension regimens, and elderly cardiovascular pharmacotherapy with over a decade of community practice.',
    languages: ['Amharic', 'English'],
    certifications: [
      'Registered Clinical Pharmacist (RPh)',
      'Certified Diabetes Care & Education Specialist',
      'EFDA Good Pharmacy Practice (GPP) Auditor',
    ],
    status: 'active',
    availableForConsultation: true,
  },
];

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepo: Repository<Doctor>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.doctorsRepo.count();
      if (count === 0) {
        for (const doc of INITIAL_DOCTORS) {
          const created = this.doctorsRepo.create(doc);
          await this.doctorsRepo.save(created);
        }
      }
    } catch {
      // Ignored if DB table not yet synchronized
    }
  }

  async findAll() {
    try {
      const doctors = await this.doctorsRepo.find({ order: { createdAt: 'DESC' } });
      if (doctors && doctors.length > 0) {
        return doctors;
      }
    } catch (err) {
      console.error('DoctorsService.findAll error from DB:', err);
    }

    return INITIAL_DOCTORS.map((d, idx) => ({
      id: idx + 1,
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async findOne(id: number) {
    try {
      const doctor = await this.doctorsRepo.findOne({ where: { id } });
      if (doctor) return doctor;
    } catch (err) {
      console.error(`DoctorsService.findOne(${id}) error from DB:`, err);
    }
    const fallback = INITIAL_DOCTORS[id - 1] || INITIAL_DOCTORS[0];
    return {
      id,
      ...fallback,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Doctor;
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
      certifications: data.certifications ?? [],
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
    if (data.certifications !== undefined) updatePayload.certifications = data.certifications;

    Object.assign(doctor, updatePayload);
    return this.doctorsRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    await this.doctorsRepo.remove(doctor);
    return { message: `Doctor ${doctor.firstName} ${doctor.lastName} deleted` };
  }
}
