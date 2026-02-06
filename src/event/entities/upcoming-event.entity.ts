import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';

@Entity('upcoming_events')
export class UpcomingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_name', type: 'varchar', length: 50 })
  eventName: string;

  @Column({ name: 'event_details', type: 'varchar', length: 100 })
  eventDetails: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'school_id', type: 'varchar', length: 12 })
  schoolId: string;

  @Column({ name: 'date_posted', type: 'datetime' })
  datePosted: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id', referencedColumnName: 'schoolId' })
  school: School;
}
