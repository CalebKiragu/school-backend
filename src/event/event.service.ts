import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EventsUssdView } from './entities/events-ussd.view';

export interface EventDto {
  eventName: string;
  eventDetails: string;
  startDate: Date;
  endDate: Date;
  schoolName: string;
}

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventsUssdView)
    private readonly eventsRepository: Repository<EventsUssdView>,
  ) {}

  async getUpcomingEvents(phoneNumber: string): Promise<EventDto[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const results = await this.eventsRepository.find({
        where: [
          {
            phone1: phoneNumber,
            startDate: MoreThanOrEqual(today),
          },
          {
            phone2: phoneNumber,
            startDate: MoreThanOrEqual(today),
          },
        ],
        order: {
          startDate: 'ASC',
        },
      });

      if (results.length > 0) {
        return results.map((result) => ({
          eventName: result.eventName,
          eventDetails: result.eventDetails,
          startDate: result.startDate,
          endDate: result.endDate,
          schoolName: result.schoolName,
        }));
      }
    } catch (error) {
      console.log('Database error:', error.message);
    }

    // Demo data fallback
    const demoData = [
      {
        eventName: 'CAT 1 Exams',
        eventDetails: 'Beginning of CAT 1 Exams',
        startDate: new Date('2026-04-12'),
        endDate: new Date('2026-04-12'),
        schoolName: 'Sigalame Boys',
      },
      {
        eventName: 'Opening Date',
        eventDetails: 'Students to resume learning',
        startDate: new Date('2026-04-12'),
        endDate: new Date('2026-04-12'),
        schoolName: 'Sigalame Boys',
      },
      {
        eventName: 'End year Exams',
        eventDetails: 'Beginning of End Term exams F1-F3',
        startDate: new Date('2026-04-12'),
        endDate: new Date('2026-04-12'),
        schoolName: 'Sigalame Boys',
      },
    ];

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
    ];
    if (demoPhones.includes(phoneNumber)) {
      return demoData;
    }

    return [];
  }

  formatEventsForUssd(events: EventDto[]): string {
    if (events.length === 0) {
      return 'CON No upcoming events at the moment\n0:Back';
    }

    let response = 'CON Upcoming Events\n';
    events.forEach((event, index) => {
      const startDate = new Date(event.startDate);
      const formattedDate = startDate.toLocaleDateString('en-GB'); // dd/mm/yyyy format

      // Truncate long event details to fit USSD response
      const truncatedDetails =
        event.eventDetails.length > 50
          ? event.eventDetails.substring(0, 47) + '...'
          : event.eventDetails;

      response += `${index + 1}. ${event.eventName}\n`;
      response += `Date: ${formattedDate}\n`;
      response += `${truncatedDetails}\n\n`;
    });

    response += '0:Back';
    return response;
  }
}
