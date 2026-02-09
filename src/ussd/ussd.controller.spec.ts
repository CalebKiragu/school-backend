import { Test, TestingModule } from '@nestjs/testing';
import { UssdController } from './ussd.controller';
import { UssdService } from './ussd.service';

describe('UssdController', () => {
  let controller: UssdController;

  const mockUssdService = {
    handleUssdRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UssdController],
      providers: [
        {
          provide: UssdService,
          useValue: mockUssdService,
        },
      ],
    }).compile();

    controller = module.get<UssdController>(UssdController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleUssdWebhook', () => {
    it('should handle USSD request with form-encoded content type', async () => {
      const mockRequest = {
        sessionId: 'test-session',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      mockUssdService.handleUssdRequest.mockResolvedValue(
        'CON Welcome to Test School',
      );

      const result = await controller.handleUssdWebhook(
        mockRequest,
        'application/x-www-form-urlencoded',
      );

      expect(result).toBe('CON Welcome to Test School');
      expect(mockUssdService.handleUssdRequest).toHaveBeenCalledWith(
        mockRequest,
      );
    });

    it('should handle USSD request with JSON content type', async () => {
      const mockRequest = {
        sessionId: 'test-session',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      mockUssdService.handleUssdRequest.mockResolvedValue(
        'CON Welcome to Test School',
      );

      const result = await controller.handleUssdWebhook(
        mockRequest,
        'application/json',
      );

      expect(result).toBe('CON Welcome to Test School');
      expect(mockUssdService.handleUssdRequest).toHaveBeenCalledWith(
        mockRequest,
      );
    });

    it('should return error for invalid content type', async () => {
      const mockRequest = {
        sessionId: 'test-session',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      const result = await controller.handleUssdWebhook(
        mockRequest,
        'text/plain',
      );

      expect(result).toBe('END Invalid request format');
      expect(mockUssdService.handleUssdRequest).not.toHaveBeenCalled();
    });

    it('should handle undefined content type', async () => {
      const mockRequest = {
        sessionId: 'test-session',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      const result = await controller.handleUssdWebhook(
        mockRequest,
        undefined as string,
      );

      expect(result).toBe('END Invalid request format');
      expect(mockUssdService.handleUssdRequest).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      const mockRequest = {
        sessionId: 'test-session',
        serviceCode: '*123#',
        phoneNumber: '+254712345678',
        text: '1',
      };

      mockUssdService.handleUssdRequest.mockRejectedValue(
        new Error('Service error'),
      );

      const result = await controller.handleUssdWebhook(
        mockRequest,
        'application/x-www-form-urlencoded',
      );

      expect(result).toBe(
        'END Service temporarily unavailable. Please try again later.',
      );
    });
  });
});
