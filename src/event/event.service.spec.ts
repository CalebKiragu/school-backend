import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EventService, EventDto } from './event.service';
import { EventsUssdView } from './entities/events-ussd.view';

describe('EventService', () => {
  let service: EventService;
  let eventsRepository: Repository<EventsUssdView>;

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
    eventsRepository = module.get<Repository<EventsUssdView>>(
      getRepositoryToken(EventsUssdView),
    );
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
      expect(mockEventsRepository.find).toHaveBeenCalledWith({
        where: [
          {
            phone1: phoneNumber,
            startDate: expect.any(Object), // MoreThanOrEqual matcher
          },
          {
            phone2: phoneNumber,
            startDate: expect.any(Object), // MoreThanOrEqual matcher
          },
        ],
        order: {
          startDate: 'ASC',
        },
      });
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

      expect(result).toContain('CON Upcoming Events');
      expect(result).toContain('1. Sports Day');
      expect(result).toContain('2. Parent Meeting');
      expect(result).toContain('Date: 15/03/2024');
      expect(result).toContain('Date: 10/04/2024');
      expect(result).toContain('0:Back');
    });

    it('should truncate long event details', () => {
      const events: EventDto[] = [
        {
          eventName: 'Long Event',
          eventDetails:
            'This is a very long event description that should be truncated because it exceeds the maximum length allowed for USSD display',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-15'),
          schoolName: 'Test School',
        },
      ];

      const result = service.formatEventsForUssd(events);

      expect(result).toContain(
        'This is a very long event description that shou...',
      );
    });

    it('should return not available message for empty events', () => {
      const result = service.formatEventsForUssd([]);

      expect(result).toBe('CON No upcoming events at the moment\n0:Back');
    });
  });
});
