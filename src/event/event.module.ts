import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventsUssdView } from './entities/events-ussd.view';

@Module({
  imports: [TypeOrmModule.forFeature([EventsUssdView])],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
