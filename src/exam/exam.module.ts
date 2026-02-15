import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamResultsUssdView } from './entities/exam-results-ussd.view';
import { ExamResult } from './entities/exam-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamResultsUssdView, ExamResult])],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
