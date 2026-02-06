import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UssdService, UssdLevel } from './ussd.service';
import { SessionLevel } from './entities/session-level.entity';
import { AuthService } from '../auth/auth.service';
import { FeeService } from '../fee/fee.service';
import { ExamService } from '../exam/exam.service';
import { EventService } from '../event/event.service';

describe('UssdService', () => {
  let service: UssdService;
  let sessionRepository: Repository<SessionLevel>;
  let authService: AuthService;
  let feeService: FeeService;
  let examService: ExamService;
  let eventService: EventService;

  const mockSessionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockAuthService = {
    validatePhoneNumber: jest.fn(),
  };

  const mockFeeService = {
    getFeeBalance: jest.fn(),
    getFeeStructure: jest.fn(),
    getPaymentInstructions: jest.fn(),
    formatFeeBalanceForUssd: jest.fn(),
    formatFeeStructureForUssd: jest.fn(),
    formatPaymentInstructionsForUssd: jest.fn(),
  };

  const mockExamService = {
    getExamResults: jest.fn(),
    formatResultsForUssd: jest.fn(),
  };

  const mockEventService = {
    getUpcomingEvents: jest.fn(),
    formatEventsForUssd: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UssdService,
        {
          provide: getRepositoryToken(SessionLevel),
          useValue: mockSessionRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: FeeService,
          useValue: mockFeeService,
        },
        {
          provide: ExamService,
          useValue: mockExamService,
        },
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    service = module.get<UssdService>(UssdService);
    sessionRepository = module.get<Repository<SessionLevel>>(
      getRepositoryToken(SessionLevel),
    );
    authService = module.get<AuthService>(AuthService);
    feeService = module.get<FeeService>(FeeService);
    examService = module.get<ExamService>(ExamService);
    eventService = module.get<EventService>(EventService);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUssdRequest', () => {
    const mockUser = {
      phoneNumber: '+254712345678',
      schoolId: 1,
      schoolName: 'Test School',
      name: 'John Doe',
      category: 'Parent',
    };

    const mockSession = {
      sessionId: 'test-session-id',
      phoneNumber: '+254712345678',
      level: UssdLevel.MAIN_MENU,
    };

    beforeEach(() => {
      mockAuthService.validatePhoneNumber.mockResolvedValue(mockUser);
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
    });

    it('should handle main menu display', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '',
      };

      const result = await service.handleUssdRequest(request);

      expect(result).toContain('CON Welcome to Test School');
      expect(result).toContain('1. Fee Balance');
      expect(result).toContain('2. Exam Results');
      expect(result).toContain('3. News and Events');
      expect(result).toContain('4. Fee Structure');
      expect(result).toContain('5. Payment Details');
    });

    it('should handle fee balance request', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      const mockFeeBalances = [
        {
          adm: 12345,
          studentName: 'John Doe',
          feeBalance: 15000,
          class: 'Form 1',
          datePosted: new Date(),
        },
      ];

      mockFeeService.getFeeBalance.mockResolvedValue(mockFeeBalances);
      mockFeeService.formatFeeBalanceForUssd.mockReturnValue(
        'CON Fee Balance: Ksh.15,000\n0:Back',
      );

      const result = await service.handleUssdRequest(request);

      expect(mockFeeService.getFeeBalance).toHaveBeenCalledWith(
        '+254712345678',
      );
      expect(result).toContain('Fee Balance: Ksh.15,000');
    });

    it('should handle exam results request', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '2',
      };

      const mockExamResults = [
        {
          adm: '12345',
          studentName: 'John Doe',
          examName: 'End Term 1',
          results: 'ENG:75KIS:80',
          class: 'Form 1',
          datePosted: new Date(),
          formattedResults: [],
        },
      ];

      mockExamService.getExamResults.mockResolvedValue(mockExamResults);
      mockExamService.formatResultsForUssd.mockReturnValue(
        'CON Exam Results: ENG:75KIS:80\n0:Back',
      );

      const result = await service.handleUssdRequest(request);

      expect(mockExamService.getExamResults).toHaveBeenCalledWith(
        '+254712345678',
      );
      expect(result).toContain('Exam Results: ENG:75KIS:80');
    });

    it('should handle events request', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '3',
      };

      const mockEvents = [
        {
          eventName: 'Sports Day',
          eventDetails: 'Annual sports competition',
          startDate: new Date(),
          endDate: new Date(),
          schoolName: 'Test School',
        },
      ];

      mockEventService.getUpcomingEvents.mockResolvedValue(mockEvents);
      mockEventService.formatEventsForUssd.mockReturnValue(
        'CON Upcoming Events: Sports Day\n0:Back',
      );

      const result = await service.handleUssdRequest(request);

      expect(mockEventService.getUpcomingEvents).toHaveBeenCalledWith(
        '+254712345678',
      );
      expect(result).toContain('Upcoming Events: Sports Day');
    });

    it('should handle fee structure menu', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '4',
      };

      const result = await service.handleUssdRequest(request);

      expect(result).toContain('CON Choose Class');
      expect(result).toContain('1. Form 1');
      expect(result).toContain('2. Form 2');
      expect(result).toContain('3. Form 3');
      expect(result).toContain('4. Form 4');
    });

    it('should handle payment instructions request', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '5',
      };

      const mockPaymentInstructions = {
        description: 'Pay via M-Pesa to 123456',
        schoolName: 'Test School',
      };

      mockFeeService.getPaymentInstructions.mockResolvedValue(
        mockPaymentInstructions,
      );
      mockFeeService.formatPaymentInstructionsForUssd.mockReturnValue(
        'CON Payment: M-Pesa 123456\n0:Back',
      );

      const result = await service.handleUssdRequest(request);

      expect(mockFeeService.getPaymentInstructions).toHaveBeenCalledWith(
        '+254712345678',
      );
      expect(result).toContain('Payment: M-Pesa 123456');
    });

    it('should handle unregistered phone number', async () => {
      const request = {
        sessionId: 'test-session-id',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '',
      };

      mockAuthService.validatePhoneNumber.mockRejectedValue(
        new Error('Phone number not registered'),
      );

      const result = await service.handleUssdRequest(request);

      expect(result).toBe(
        'END Sorry, phone number is not registered in the system.',
      );
    });
  });

  describe('getOrCreateSession', () => {
    it('should return existing session', async () => {
      const sessionId = 'test-session-id';
      const phoneNumber = '+254712345678';
      const existingSession = {
        sessionId,
        phoneNumber,
        level: UssdLevel.MAIN_MENU,
      };

      mockSessionRepository.findOne.mockResolvedValue(existingSession);

      const result = await service['getOrCreateSession'](
        sessionId,
        phoneNumber,
      );

      expect(result).toEqual(existingSession);
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId },
      });
    });

    it('should create new session when none exists', async () => {
      const sessionId = 'test-session-id';
      const phoneNumber = '+254712345678';
      const newSession = {
        sessionId,
        phoneNumber,
        level: UssdLevel.INITIAL,
      };

      mockSessionRepository.findOne.mockResolvedValue(null);
      mockSessionRepository.create.mockReturnValue(newSession);
      mockSessionRepository.save.mockResolvedValue(newSession);

      const result = await service['getOrCreateSession'](
        sessionId,
        phoneNumber,
      );

      expect(result).toEqual(newSession);
      expect(mockSessionRepository.create).toHaveBeenCalledWith({
        sessionId,
        phoneNumber,
        level: UssdLevel.INITIAL,
      });
      expect(mockSessionRepository.save).toHaveBeenCalledWith(newSession);
    });
  });
});
