import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';

@Entity('student_contacts')
export class StudentContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  adm: number;

  @Column({ name: 'student_name', type: 'varchar', length: 50 })
  studentName: string;

  @Column({ name: 'parent_phone1', type: 'varchar', length: 13 })
  parentPhone1: string;

  @Column({ name: 'parent_phone2', type: 'varchar', length: 13 })
  parentPhone2: string;

  @Column({ type: 'varchar', length: 20 })
  stream: string;

  @Column({ type: 'varchar', length: 20 })
  class: string;

  @Column({ name: 'school_id', type: 'int' })
  schoolId: number;

  @Column({ name: 'date_posted', type: 'datetime' })
  datePosted: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id', referencedColumnName: 'id' })
  school: School;
}
