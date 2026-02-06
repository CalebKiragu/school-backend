import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';

@Entity('stakeholders')
export class Stakeholder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @Column({ type: 'varchar', length: 15 })
  phone1: string;

  @Column({ type: 'varchar', length: 50 })
  phone2: string;

  @Column({ name: 'school_id', type: 'int' })
  schoolId: number;

  @Column({ name: 'date_posted', type: 'datetime' })
  datePosted: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id', referencedColumnName: 'id' })
  school: School;
}
