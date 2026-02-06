import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';

@Entity('fee_structure')
export class FeeStructure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  class: string;

  @Column({ type: 'int' })
  term1: number;

  @Column({ type: 'int' })
  term2: number;

  @Column({ type: 'int' })
  term3: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ name: 'school_id', type: 'int' })
  schoolId: number;

  @Column({ name: 'date_posted', type: 'datetime' })
  datePosted: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id', referencedColumnName: 'id' })
  school: School;
}
