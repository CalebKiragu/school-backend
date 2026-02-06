import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token and user info', async () => {
      const loginDto = { phoneNumber: '+254712345678' };
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          phoneNumber: '+254712345678',
          schoolId: 1,
          schoolName: 'Test School',
          name: 'John Doe',
          category: 'Parent',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith('+254712345678');
    });
  });

  describe('verify', () => {
    it('should return valid token response', async () => {
      const mockRequest = {
        user: {
          phoneNumber: '+254712345678',
          schoolId: 1,
          schoolName: 'Test School',
        },
      };

      const result = await controller.verify(mockRequest);

      expect(result).toEqual({
        valid: true,
        user: mockRequest.user,
      });
    });
  });
});
