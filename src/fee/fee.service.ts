import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeBalanceUssdView } from './entities/fee-balance-ussd.view';
import { FeeStructureUssdView } from './entities/fee-structure-ussd.view';
import { PaymentInstructionsUssdView } from './entities/payment-instructions-ussd.view';

export interface FeeBalanceDto {
  adm: number;
  studentName: string;
  feeBalance: number;
  class: string;
  datePosted: Date;
  expectedClearanceDate?: Date;
  paymentInstructions?: {
    paybill: {
      businessNumber: string;
      accountNumber: string;
    };
    bank: {
      name: string;
      branch: string;
      accountNumber: string;
    };
  };
}

export interface FeeStructureDto {
  class: string;
  term1: number;
  term2: number;
  term3: number;
  total: number;
  schoolName: string;
  datePosted: Date;
}

export interface PaymentInstructionsDto {
  description: string;
  schoolName: string;
}

@Injectable()
export class FeeService {
  constructor(
    @InjectRepository(FeeBalanceUssdView)
    private readonly feeBalanceRepository: Repository<FeeBalanceUssdView>,
    @InjectRepository(FeeStructureUssdView)
    private readonly feeStructureRepository: Repository<FeeStructureUssdView>,
    @InjectRepository(PaymentInstructionsUssdView)
    private readonly paymentInstructionsRepository: Repository<PaymentInstructionsUssdView>,
  ) {}

  async getFeeBalance(phoneNumber: string): Promise<FeeBalanceDto[]> {
    try {
      const results = await this.feeBalanceRepository.find({
        where: [{ parentPhone1: phoneNumber }, { parentPhone2: phoneNumber }],
      });

      if (results.length > 0) {
        return results.map((result) => ({
          adm: result.adm,
          studentName: result.studentName,
          feeBalance: result.feeBalance,
          class: result.class,
          datePosted: result.datePosted,
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database error:', errorMessage);
    }

    // Demo data fallback with comprehensive payment details
    const demoData = [
      {
        adm: 58641,
        studentName: 'MARTIN WAMALWA',
        feeBalance: 12500,
        class: 'FORM 2',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-16'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '5864158641',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 58642,
        studentName: 'KEVIN OMONDI',
        feeBalance: 8750,
        class: 'FORM 3',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-16'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '5864258642',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
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

  async getFeeStructure(
    phoneNumber: string,
    className: string,
  ): Promise<FeeStructureDto | null> {
    // Demo data for development
    const demoStructure = {
      class: className,
      term1: 22194,
      term2: 14063,
      term3: 9244,
      total: 45501,
      schoolName: 'Sigalame Boys',
      datePosted: new Date('2017-08-20'),
    };

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
    ];
    if (demoPhones.includes(phoneNumber)) {
      return demoStructure;
    }

    try {
      const result = await this.feeStructureRepository.findOne({
        where: [
          { phone1: phoneNumber, class: className },
          { phone2: phoneNumber, class: className },
        ],
      });

      if (!result) return demoStructure;

      return {
        class: result.class,
        term1: result.term1,
        term2: result.term2,
        term3: result.term3,
        total: result.total,
        schoolName: result.schoolName,
        datePosted: result.datePosted,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database error, returning demo data:', errorMessage);
      return demoStructure;
    }
  }

  async getPaymentInstructions(
    phoneNumber: string,
  ): Promise<PaymentInstructionsDto | null> {
    // Demo data for development
    const demoInstructions = {
      description:
        'Parents are asked to pay fees by bankers cheque, money order payable to Sigalame Boys or deposit in the school account No. 010210365017-00 National Bank of Kenya',
      schoolName: 'Sigalame Boys',
    };

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
    ];
    if (demoPhones.includes(phoneNumber)) {
      return demoInstructions;
    }

    try {
      const result = await this.paymentInstructionsRepository.findOne({
        where: [{ phone1: phoneNumber }, { phone2: phoneNumber }],
      });

      if (!result) return demoInstructions;

      return {
        description: result.description,
        schoolName: result.schoolName,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database error, returning demo data:', errorMessage);
      return demoInstructions;
    }
  }

  formatFeeBalanceForUssd(balances: FeeBalanceDto[]): string {
    if (balances.length === 0) {
      return 'CON Fee Balance not available at the moment\n0:Back';
    }

    let response = 'CON ';
    balances.forEach((balance) => {
      const date = new Date(balance.datePosted);
      const formattedDate = date.toLocaleDateString('en-GB');
      response += `Fee Balance for ${balance.studentName} as at ${formattedDate} is Ksh.${balance.feeBalance.toLocaleString()}\n`;
    });
    response += '0:Back';

    return response;
  }

  formatFeeStructureForUssd(structure: FeeStructureDto | null): string {
    if (!structure) {
      return 'CON Fee Structure not available at the moment\n0:Back';
    }

    return (
      `CON Fee Structure\n${structure.schoolName}\n` +
      `Term 1: Ksh.${structure.term1.toLocaleString()}\n` +
      `Term 2: Ksh.${structure.term2.toLocaleString()}\n` +
      `Term 3: Ksh.${structure.term3.toLocaleString()}\n` +
      `Total: Ksh.${structure.total.toLocaleString()}\n` +
      '0:Back'
    );
  }

  formatPaymentInstructionsForUssd(
    instructions: PaymentInstructionsDto | null,
  ): string {
    if (!instructions) {
      return 'CON Payment details not available at the moment\n0:Back';
    }

    return `CON ${instructions.schoolName}\n${instructions.description}\n0:Back`;
  }
}
