import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, UserInfo } from './auth.service';
import { AllContactsUssdView } from '../school/entities/all-contacts-ussd.view';

describe('AuthService', () => {
  let service: AuthService;
  let contactsRepository: Repository<AllContactsUssdView>;
  let jwtService: JwtService;

  const mockContactsRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AllContactsUssdView),
          useValue: mockContactsRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    contactsRepository = module.get<Repository<AllContactsUssdView>>(
      getRepositoryToken(AllContactsUssdView),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePhoneNumber', () => {
    it('should return user info for valid phone number', async () => {
      const phoneNumber = '+254712345678';
      const mockContact = {
        name: 'John Doe',
        schoolId: 1,
        schoolName: 'Test School',
        category: 'Parent',
      };

      mockContactsRepository.findOne.mockResolvedValue(mockContact);

      const result = await service.validatePhoneNumber(phoneNumber);

      expect(result).toEqual({
        phoneNumber: '+254712345678',
        schoolId: 1,
        schoolName: 'Test School',
        name: 'John Doe',
        category: 'Parent',
      });
    });

    it('should throw UnauthorizedException for invalid phone number', async () => {
      const phoneNumber = '+254712345678';
      mockContactsRepository.findOne.mockResolvedValue(null);

      await expect(service.validatePhoneNumber(phoneNumber)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize phone number starting with 254', () => {
      const phoneNumber = '254712345678';
      const result = service.normalizePhoneNumber(phoneNumber);
      expect(result).toBe('+254712345678');
    });

    it('should normalize phone number starting with 0', () => {
      const phoneNumber = '0712345678';
      const result = service.normalizePhoneNumber(phoneNumber);
      expect(result).toBe('+254712345678');
    });

    it('should normalize 9-digit phone number', () => {
      const phoneNumber = '712345678';
      const result = service.normalizePhoneNumber(phoneNumber);
      expect(result).toBe('+254712345678');
    });

    it('should handle phone number with + prefix', () => {
      const phoneNumber = '+254712345678';
      const result = service.normalizePhoneNumber(phoneNumber);
      expect(result).toBe('+254712345678');
    });

    it('should handle phone number with non-numeric characters', () => {
      const phoneNumber = '+254-712-345-678';
      const result = service.normalizePhoneNumber(phoneNumber);
      expect(result).toBe('+254712345678');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token for user', async () => {
      const user: UserInfo = {
        phoneNumber: '+254712345678',
        schoolId: 1,
        schoolName: 'Test School',
        name: 'John Doe',
        category: 'Parent',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.generateToken(user);

      expect(result).toBe(mockToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        phoneNumber: '+254712345678',
        schoolId: 1,
        schoolName: 'Test School',
      });
    });
  });

  describe('login', () => {
    it('should return token and user info for valid login', async () => {
      const phoneNumber = '0712345678';
      const mockContact = {
        name: 'John Doe',
        schoolId: 1,
        schoolName: 'Test School',
        category: 'Parent',
      };
      const mockToken = 'mock-jwt-token';

      mockContactsRepository.findOne.mockResolvedValue(mockContact);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(phoneNumber);

      expect(result).toEqual({
        token: mockToken,
        user: {
          phoneNumber: '+254712345678',
          schoolId: 1,
          schoolName: 'Test School',
          name: 'John Doe',
          category: 'Parent',
        },
      });
    });

    it('should throw UnauthorizedException for invalid login', async () => {
      const phoneNumber = '0712345678';
      mockContactsRepository.findOne.mockResolvedValue(null);

      await expect(service.login(phoneNumber)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
