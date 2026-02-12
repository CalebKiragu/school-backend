import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventService, EventDto } from './event.service';
import { EventsUssdView } from './entities/events-ussd.view';

describe('EventService', () => {
  let service: EventService;

  const mockEventsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(EventsUssdView),
          useValue: mockEventsRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUpcomingEvents', () => {
    it('should return upcoming events for a phone number', async () => {
      const phoneNumber = '+254712345678';
      const mockEvents = [
        {
          eventName: 'Sports Day',
          eventDetails: 'Annual sports competition',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-15'),
          schoolName: 'Test School',
        },
        {
          eventName: 'Parent Meeting',
          eventDetails: 'Quarterly parent-teacher meeting',
          startDate: new Date('2024-04-10'),
          endDate: new Date('2024-04-10'),
          schoolName: 'Test School',
        },
      ];

      mockEventsRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getUpcomingEvents(phoneNumber);

      expect(result).toHaveLength(2);
      expect(result[0].eventName).toBe('Sports Day');
      expect(result[1].eventName).toBe('Parent Meeting');
      expect(mockEventsRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no upcoming events found', async () => {
      const phoneNumber = '+254712345678';
      mockEventsRepository.find.mockResolvedValue([]);

      const result = await service.getUpcomingEvents(phoneNumber);

      expect(result).toEqual([]);
    });
  });

  describe('formatEventsForUssd', () => {
    it('should format events for USSD display', () => {
      const events: EventDto[] = [
        {
          eventName: 'Sports Day',
          eventDetails: 'Annual sports competition',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-15'),
          schoolName: 'Test School',
        },
        {
          eventName: 'Parent Meeting',
          eventDetails: 'Quarterly parent-teacher meeting',
          startDate: new Date('2024-04-10'),
          endDate: new Date('2024-04-10'),
          schoolName: 'Test School',
        },
      ];

      const result = service.formatEventsForUssd(events);

      expect(result).toContain('END Upcoming Events');
      expect(result).toContain('1. Sports Day');
      expect(result).toContain('2. Parent Meeting');
      expect(result).toContain('15/03/2024');
      expect(result).toContain('10/04/2024');
    });

    it('should limit events to 5', () => {
      const events: EventDto[] = Array.from({ length: 10 }, (_, i) => ({
        eventName: `Event ${i + 1}`,
        eventDetails: 'Event description',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-15'),
        schoolName: 'Test School',
      }));

      const result = service.formatEventsForUssd(events);

      expect(result).toContain('1. Event 1');
      expect(result).toContain('5. Event 5');
      expect(result).toContain('...and 5 more');
      expect(result).not.toContain('6. Event 6');
    });

    it('should return not available message for empty events', () => {
      const result = service.formatEventsForUssd([]);

      expect(result).toBe('END No upcoming events at the moment.');
    });
  });
});
