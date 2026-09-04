import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ length: 100 })
  specialization!: string;

  @Column({ default: 0 })
  experienceYears!: number;

  @Column({ length: 255, unique: true })
  contactEmail!: string;

  @Column({ length: 50, nullable: true })
  contactPhone?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column('simple-array', { nullable: true })
  languages?: string[];

  @Column('simple-array', { nullable: true })
  certifications?: string[];

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ default: true })
  availableForConsultation!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
