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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database error:', errorMessage);
    }

    // Demo data fallback with specific school events
    const demoData = [
      {
        eventName: 'Form Four Academic day',
        eventDetails: 'Academic day for Form Four students',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-01'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Form Three Academic day',
        eventDetails: 'Academic day for Form Three students',
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-08'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: "Grade Ten parents' orientation",
        eventDetails: 'Orientation session for Grade Ten parents',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-15'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Sending learners home to collect fees',
        eventDetails: 'Students will be sent home to collect outstanding fees',
        startDate: new Date('2026-03-16'),
        endDate: new Date('2026-03-16'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Beginning of End of Term I exams',
        eventDetails: 'Start of End of Term I examinations',
        startDate: new Date('2026-03-18'),
        endDate: new Date('2026-03-18'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Annual key closure of Term one I',
        eventDetails: 'Official closure of Term One',
        startDate: new Date('2026-04-14'),
        endDate: new Date('2026-04-14'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Opening of Term Two II',
        eventDetails: 'Students to resume for Term Two',
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-04-28'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        eventName: 'Annual general meeting',
        eventDetails: 'Annual general meeting for parents and stakeholders',
        startDate: new Date('2026-05-21'),
        endDate: new Date('2026-05-21'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
    ];

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
      '+254748944951', // Admin phone
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
