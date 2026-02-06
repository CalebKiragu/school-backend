import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user') // Maps to the 'user' table in the existing schema
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ name: 'school_name', type: 'varchar', length: 100 })
  schoolName: string;

  @Column({ name: 'school_id', type: 'varchar', length: 15, unique: true })
  schoolId: string;

  @Column({ type: 'varchar', length: 100 })
  phone: string;

  @Column({ type: 'int' })
  population: number;

  @Column({ type: 'varchar', length: 10 })
  role: string;

  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ name: 'last_login', type: 'varchar', length: 100 })
  lastLogin: string;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ name: 'date_modified', type: 'datetime' })
  dateModified: Date;

  @Column({ name: 'date_registered', type: 'datetime' })
  dateRegistered: Date;
}
