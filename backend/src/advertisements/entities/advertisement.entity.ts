import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 10, default: 'image' })
  mediaType!: string;

  @Column({ type: 'text', nullable: true })
  mediaUrl?: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'text', nullable: true })
  targetUrl?: string;

  @Column({ length: 100, default: 'homepage' })
  targetPage!: string;

  @Column({ length: 100, default: 'disease_solution' })
  position!: string;

  @Column({ default: 0 })
  displayOrder!: number;

  @Column({ type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  /** draft | published | expired */
  @Column({ length: 20, default: 'published' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @Column({ length: 255, nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
