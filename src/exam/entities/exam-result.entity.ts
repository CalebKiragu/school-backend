import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';

@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6 })
  adm: string;

  @Column({ name: 'student_name', type: 'varchar', length: 100 })
  studentName: string;

  @Column({ name: 'exam_name', type: 'varchar', length: 50 })
  examName: string;

  @Column({ type: 'text' })
  results: string;

  @Column({ type: 'varchar', length: 10 })
  stream: string;

  @Column({ type: 'varchar', length: 10 })
  class: string;

  @Column({ name: 'school_id', type: 'int' })
  schoolId: number;

  @Column({ name: 'date_posted', type: 'datetime' })
  datePosted: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id', referencedColumnName: 'id' })
  school: School;
}
