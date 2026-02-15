import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StudentContact } from '../student/entities/student-contact.entity';
import { UpcomingEvent } from '../event/entities/upcoming-event.entity';
import { ExamResult } from '../exam/entities/exam-result.entity';
import { FeePayment } from '../fee/entities/fee-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentContact,
      UpcomingEvent,
      ExamResult,
      FeePayment,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
