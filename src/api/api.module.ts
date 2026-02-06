import { Module } from '@nestjs/common';
import { FeeController } from './controllers/fee.controller';
import { ExamController } from './controllers/exam.controller';
import { EventController } from './controllers/event.controller';
import { FeeModule } from '../fee/fee.module';
import { ExamModule } from '../exam/exam.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [FeeModule, ExamModule, EventModule],
  controllers: [FeeController, ExamController, EventController],
})
export class ApiModule {}
