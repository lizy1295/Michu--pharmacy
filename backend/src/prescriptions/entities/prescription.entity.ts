import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PrescriptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UPLOAD_REQUESTED = 'upload_requested',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn({ name: 'prescription_id' })
  id!: number;

  @Column({ name: 'prescription_number', type: 'varchar', length: 50, unique: true })
  prescriptionNumber!: string;

  @Column({ name: 'patient_name', type: 'varchar', length: 100 })
  patientName!: string;

  @Index('IDX_prescriptions_patient_email')
  @Column({ name: 'patient_email', type: 'varchar', length: 150 })
  patientEmail!: string;

  @Column({ name: 'doctor_name', type: 'varchar', length: 100, nullable: true })
  doctorName?: string;

  @Column({ name: 'doctor_license', type: 'varchar', length: 50, nullable: true })
  doctorLicense?: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 30,
    default: PrescriptionStatus.PENDING,
  })
  status!: PrescriptionStatus;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl!: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
