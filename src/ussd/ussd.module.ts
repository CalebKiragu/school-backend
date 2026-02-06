import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UssdController } from './ussd.controller';
import { UssdService } from './ussd.service';
import { SessionLevel } from './entities/session-level.entity';
import { AllContactsUssdView } from '../school/entities/all-contacts-ussd.view';
import { AuthModule } from '../auth/auth.module';
import { FeeModule } from '../fee/fee.module';
import { ExamModule } from '../exam/exam.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionLevel, AllContactsUssdView]),
    AuthModule,
    FeeModule,
    ExamModule,
    EventModule,
  ],
  controllers: [UssdController],
  providers: [UssdService],
})
export class UssdModule {}
