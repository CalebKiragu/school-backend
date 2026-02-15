import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EventsUssdView } from './entities/events-ussd.view';

export interface EventDto {
  id?: number;
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
        return results.map((result, index) => ({
          id: index + 1, // Add sequential IDs for database results
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
        id: 1,
        eventName: 'Form Four Academic day',
        eventDetails: 'Academic day for Form Four students',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-01'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 2,
        eventName: 'Form Three Academic day',
        eventDetails: 'Academic day for Form Three students',
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-08'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 3,
        eventName: "Grade Ten parents' orientation",
        eventDetails: 'Orientation session for Grade Ten parents',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-15'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 4,
        eventName: 'Sending learners home to collect fees',
        eventDetails: 'Students will be sent home to collect outstanding fees',
        startDate: new Date('2026-03-16'),
        endDate: new Date('2026-03-16'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 5,
        eventName: 'Beginning of End of Term I exams',
        eventDetails: 'Start of End of Term I examinations',
        startDate: new Date('2026-03-18'),
        endDate: new Date('2026-03-18'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 6,
        eventName: 'Annual key closure of Term one I',
        eventDetails: 'Official closure of Term One',
        startDate: new Date('2026-04-14'),
        endDate: new Date('2026-04-14'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 7,
        eventName: 'Opening of Term Two II',
        eventDetails: 'Students to resume for Term Two',
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-04-28'),
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
      },
      {
        id: 8,
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
      '+254720613991', // Admin - Didimo Mukati
      '+254742218359', // Admin - Wandera Mofati
      '+254701234567', // Xavier Kelvin
      '+254702345678', // David Bwire
      '+254703456789', // Dybal Angoya
      '+254704567890', // Raymond Mandoli
      '+254705678901', // Willingtone Ojambo
      '+254706789012', // Allan Sembu
      '+254707890123', // Deogracious Wando
      '+254708901234', // Aine Wesonga
      '+254709012345', // Vincent Owen
      '+254710123456', // Prince Joel
    ];
    if (demoPhones.includes(phoneNumber)) {
      return demoData;
    }

    return [];
  }

  formatEventsForUssd(events: EventDto[]): string {
    if (events.length === 0) {
      return 'END No upcoming events at the moment.';
    }

    // Show only next 5 events to avoid overwhelming the user
    const eventsToShow = events.slice(0, 5);

    let response = 'END Upcoming Events\n\n';
    eventsToShow.forEach((event, index) => {
      const startDate = new Date(event.startDate);
      const formattedDate = startDate.toLocaleDateString('en-GB'); // dd/mm/yyyy format

      response += `${index + 1}. ${event.eventName}\n`;
      response += `   ${formattedDate}\n`;

      if (index < eventsToShow.length - 1) {
        response += '\n';
      }
    });

    if (events.length > 5) {
      response += `\n...and ${events.length - 5} more`;
    }

    return response;
  }
}
