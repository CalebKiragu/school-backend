import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';

@Entity('fee_payments')
export class FeePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  adm: number;

  @Column({ name: 'student_name', type: 'varchar', length: 100 })
  studentName: string;

  @Column({ name: 'fee_balance', type: 'int' })
  feeBalance: number;

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
