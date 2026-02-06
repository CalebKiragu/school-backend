import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamResultsUssdView } from './entities/exam-results-ussd.view';

@Module({
  imports: [TypeOrmModule.forFeature([ExamResultsUssdView])],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
