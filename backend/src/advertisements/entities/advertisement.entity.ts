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

  @Column({ name: 'media_type', length: 20, default: 'image' })
  mediaType!: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl?: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'target_url', type: 'text', nullable: true })
  targetUrl?: string;

  @Column({ name: 'target_page', length: 100, default: 'homepage' })
  targetPage!: string;

  @Column({ length: 100, default: 'disease_solution' })
  position!: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string;

  /** draft | published | expired */
  @Column({ length: 20, default: 'published' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @Column({ name: 'created_by', length: 255, nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
