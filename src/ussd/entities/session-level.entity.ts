import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('session_levels')
export class SessionLevel {
  @PrimaryColumn({ name: 'session_id', type: 'varchar', length: 50 })
  sessionId: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 25, nullable: true })
  phoneNumber: string;

  @Column({ type: 'tinyint', nullable: true })
  level: number;
}
