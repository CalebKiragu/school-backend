import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  FeeService,
  FeeBalanceDto,
  FeeStructureDto,
  PaymentInstructionsDto,
} from './fee.service';
import { FeeBalanceUssdView } from './entities/fee-balance-ussd.view';
import { FeeStructureUssdView } from './entities/fee-structure-ussd.view';
import { PaymentInstructionsUssdView } from './entities/payment-instructions-ussd.view';

describe('FeeService', () => {
  let service: FeeService;

  const mockFeeBalanceRepository = {
    find: jest.fn(),
  };

  const mockFeeStructureRepository = {
    findOne: jest.fn(),
  };

  const mockPaymentInstructionsRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeService,
        {
          provide: getRepositoryToken(FeeBalanceUssdView),
          useValue: mockFeeBalanceRepository,
        },
        {
          provide: getRepositoryToken(FeeStructureUssdView),
          useValue: mockFeeStructureRepository,
        },
        {
          provide: getRepositoryToken(PaymentInstructionsUssdView),
          useValue: mockPaymentInstructionsRepository,
        },
      ],
    }).compile();

    service = module.get<FeeService>(FeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeeBalance', () => {
    it('should return fee balance for a phone number from database', async () => {
      const phoneNumber = '+254712345678';
      const mockFeeBalance = [
        {
          adm: 12345,
          studentName: 'John Doe',
          feeBalance: 15000,
          class: 'Form 1',
          datePosted: new Date('2024-01-15'),
        },
      ];

      mockFeeBalanceRepository.find.mockResolvedValue(mockFeeBalance);

      const result = await service.getFeeBalance(phoneNumber);

      expect(result).toEqual([
        {
          adm: 12345,
          studentName: 'John Doe',
          feeBalance: 15000,
          class: 'Form 1',
          datePosted: new Date('2024-01-15'),
        },
      ]);
      expect(mockFeeBalanceRepository.find).toHaveBeenCalledWith({
        where: [{ parentPhone1: phoneNumber }, { parentPhone2: phoneNumber }],
      });
    });

    it('should return demo data for demo phone numbers', async () => {
      const phoneNumber = '+254724027217';
      mockFeeBalanceRepository.find.mockResolvedValue([]);

      const result = await service.getFeeBalance(phoneNumber);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('adm');
      expect(result[0]).toHaveProperty('studentName');
      expect(result[0]).toHaveProperty('feeBalance');
      expect(result[0]).toHaveProperty('paymentInstructions');
    });

    it('should return empty array for non-demo phone numbers with no database records', async () => {
      const phoneNumber = '+254999999999';
      mockFeeBalanceRepository.find.mockResolvedValue([]);

      const result = await service.getFeeBalance(phoneNumber);

      expect(result).toEqual([]);
    });
  });

  describe('getFeeStructure', () => {
    it('should return fee structure for a phone number and class from database', async () => {
      const phoneNumber = '+254712345678';
      const className = 'Form 1';
      const mockFeeStructure = {
        class: 'Form 1',
        term1: 15000,
        term2: 15000,
        term3: 15000,
        total: 45000,
        schoolName: 'Test School',
        datePosted: new Date('2024-01-15'),
      };

      mockFeeStructureRepository.findOne.mockResolvedValue(mockFeeStructure);

      const result = await service.getFeeStructure(phoneNumber, className);

      expect(result).toEqual({
        class: 'Form 1',
        term1: 15000,
        term2: 15000,
        term3: 15000,
        total: 45000,
        schoolName: 'Test School',
        datePosted: new Date('2024-01-15'),
      });
    });

    it('should return demo data for demo phone numbers', async () => {
      const phoneNumber = '+254724027217';
      const className = 'Form 1';
      mockFeeStructureRepository.findOne.mockResolvedValue(null);

      const result = await service.getFeeStructure(phoneNumber, className);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('class');
      expect(result).toHaveProperty('term1');
      expect(result).toHaveProperty('total');
    });

    it('should return demo data when no database record found', async () => {
      const phoneNumber = '+254999999999';
      const className = 'Form 1';
      mockFeeStructureRepository.findOne.mockResolvedValue(null);

      const result = await service.getFeeStructure(phoneNumber, className);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('schoolName');
    });
  });

  describe('getPaymentInstructions', () => {
    it('should return payment instructions for a phone number from database', async () => {
      const phoneNumber = '+254712345678';
      const mockPaymentInstructions = {
        description: 'Pay via M-Pesa to 123456',
        schoolName: 'Test School',
      };

      mockPaymentInstructionsRepository.findOne.mockResolvedValue(
        mockPaymentInstructions,
      );

      const result = await service.getPaymentInstructions(phoneNumber);

      expect(result).toEqual({
        description: 'Pay via M-Pesa to 123456',
        schoolName: 'Test School',
      });
    });

    it('should return demo data for demo phone numbers', async () => {
      const phoneNumber = '+254724027217';
      mockPaymentInstructionsRepository.findOne.mockResolvedValue(null);

      const result = await service.getPaymentInstructions(phoneNumber);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('schoolName');
    });

    it('should return demo data when no database record found', async () => {
      const phoneNumber = '+254999999999';
      mockPaymentInstructionsRepository.findOne.mockResolvedValue(null);

      const result = await service.getPaymentInstructions(phoneNumber);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('schoolName');
    });
  });

  describe('formatFeeBalanceForUssd', () => {
    it('should format fee balance for USSD display', () => {
      const feeBalances: FeeBalanceDto[] = [
        {
          adm: 12345,
          studentName: 'John Doe',
          feeBalance: 15000,
          class: 'Form 1',
          datePosted: new Date('2024-01-15'),
        },
      ];

      const result = service.formatFeeBalanceForUssd(feeBalances);

      expect(result).toContain('CON');
      expect(result).toContain('John Doe');
      expect(result).toContain('Ksh.15,000');
      expect(result).toContain('0:Back');
    });

    it('should return not available message for empty fee balance', () => {
      const result = service.formatFeeBalanceForUssd([]);

      expect(result).toBe(
        'CON Fee Balance not available at the moment\n0:Back',
      );
    });
  });

  describe('formatFeeStructureForUssd', () => {
    it('should format fee structure for USSD display', () => {
      const feeStructure: FeeStructureDto = {
        class: 'Form 1',
        term1: 15000,
        term2: 15000,
        term3: 15000,
        total: 45000,
        schoolName: 'Test School',
        datePosted: new Date('2024-01-15'),
      };

      const result = service.formatFeeStructureForUssd(feeStructure);

      expect(result).toContain('CON Fee Structure');
      expect(result).toContain('Test School');
      expect(result).toContain('Term 1: Ksh.15,000');
      expect(result).toContain('Total: Ksh.45,000');
      expect(result).toContain('0:Back');
    });

    it('should return not available message for null fee structure', () => {
      const result = service.formatFeeStructureForUssd(null);

      expect(result).toBe(
        'CON Fee Structure not available at the moment\n0:Back',
      );
    });
  });

  describe('formatPaymentInstructionsForUssd', () => {
    it('should format payment instructions for USSD display', () => {
      const paymentInstructions: PaymentInstructionsDto = {
        description: 'Pay via M-Pesa to 123456',
        schoolName: 'Test School',
      };

      const result =
        service.formatPaymentInstructionsForUssd(paymentInstructions);

      expect(result).toContain('CON Test School');
      expect(result).toContain('Pay via M-Pesa to 123456');
      expect(result).toContain('0:Back');
    });

    it('should return not available message for null payment instructions', () => {
      const result = service.formatPaymentInstructionsForUssd(null);

      expect(result).toBe(
        'CON Payment details not available at the moment\n0:Back',
      );
    });
  });
});
