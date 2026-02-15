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

    // Demo data with parent-student mapping
    const parentStudentMap: Record<string, FeeBalanceDto[]> = {
      '+254724027217': [
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
      ],
      '+254728986084': [
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
      ],
      '+254701234567': [
        {
          adm: 12077,
          studentName: 'XAVIER KELVIN',
          feeBalance: 15200,
          class: 'FORM 1',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-20'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1207712077',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254702345678': [
        {
          adm: 11586,
          studentName: 'DAVID BWIRE',
          feeBalance: 5400,
          class: 'FORM 4',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-10'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1158611586',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254703456789': [
        {
          adm: 12047,
          studentName: 'DYBAL ANGOYA',
          feeBalance: 18900,
          class: 'FORM 2',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-04-05'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1204712047',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254704567890': [
        {
          adm: 12668,
          studentName: 'RAYMOND MANDOLI',
          feeBalance: 22100,
          class: 'FORM 1',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-04-15'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1266812668',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254705678901': [
        {
          adm: 11569,
          studentName: 'WILLINGTONE OJAMBO',
          feeBalance: 9300,
          class: 'FORM 3',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-18'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1156911569',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254706789012': [
        {
          adm: 12643,
          studentName: 'ALLAN SEMBU',
          feeBalance: 14600,
          class: 'FORM 2',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-25'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1264312643',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254707890123': [
        {
          adm: 12701,
          studentName: 'DEOGRACIOUS WANDO',
          feeBalance: 19800,
          class: 'FORM 1',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-04-08'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1270112701',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254708901234': [
        {
          adm: 11831,
          studentName: 'AINE WESONGA',
          feeBalance: 6700,
          class: 'FORM 4',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-12'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1183111831',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254709012345': [
        {
          adm: 11168,
          studentName: 'VINCENT OWEN',
          feeBalance: 11400,
          class: 'FORM 3',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-22'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1116811168',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
      '+254710123456': [
        {
          adm: 11789,
          studentName: 'PRINCE JOEL',
          feeBalance: 16500,
          class: 'FORM 2',
          datePosted: new Date('2026-02-01'),
          expectedClearanceDate: new Date('2026-03-28'),
          paymentInstructions: {
            paybill: {
              businessNumber: '522123',
              accountNumber: '1178911789',
            },
            bank: {
              name: 'KCB Bank',
              branch: 'Port Victoria',
              accountNumber: '1182255744',
            },
          },
        },
      ],
    };

    // All students data for admin users
    const allStudentsData = [
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
      {
        adm: 12077,
        studentName: 'XAVIER KELVIN',
        feeBalance: 15200,
        class: 'FORM 1',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-20'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1207712077',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 11586,
        studentName: 'DAVID BWIRE',
        feeBalance: 5400,
        class: 'FORM 4',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-10'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1158611586',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 12047,
        studentName: 'DYBAL ANGOYA',
        feeBalance: 18900,
        class: 'FORM 2',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-04-05'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1204712047',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 12668,
        studentName: 'RAYMOND MANDOLI',
        feeBalance: 22100,
        class: 'FORM 1',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-04-15'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1266812668',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 11569,
        studentName: 'WILLINGTONE OJAMBO',
        feeBalance: 9300,
        class: 'FORM 3',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-18'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1156911569',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 12643,
        studentName: 'ALLAN SEMBU',
        feeBalance: 14600,
        class: 'FORM 2',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-25'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1264312643',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 12701,
        studentName: 'DEOGRACIOUS WANDO',
        feeBalance: 19800,
        class: 'FORM 1',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-04-08'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1270112701',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 11831,
        studentName: 'AINE WESONGA',
        feeBalance: 6700,
        class: 'FORM 4',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-12'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1183111831',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 11168,
        studentName: 'VINCENT OWEN',
        feeBalance: 11400,
        class: 'FORM 3',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-22'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1116811168',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
      {
        adm: 11789,
        studentName: 'PRINCE JOEL',
        feeBalance: 16500,
        class: 'FORM 2',
        datePosted: new Date('2026-02-01'),
        expectedClearanceDate: new Date('2026-03-28'),
        paymentInstructions: {
          paybill: {
            businessNumber: '522123',
            accountNumber: '1178911789',
          },
          bank: {
            name: 'KCB Bank',
            branch: 'Port Victoria',
            accountNumber: '1182255744',
          },
        },
      },
    ];

    // Admin phones - return all students
    const adminPhones = [
      '+254720613991', // Principal
      '+254748944951', // Wandera (Admin)
      '+254742218359', // Admin User
    ];

    if (adminPhones.includes(phoneNumber)) {
      return allStudentsData;
    }

    // Parent phones - return only their student(s)
    if (parentStudentMap[phoneNumber]) {
      return parentStudentMap[phoneNumber];
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
      return 'END Fee Balance not available at the moment.';
    }

    if (balances.length === 1) {
      // Single student - show detailed info
      const balance = balances[0];
      if (!balance) {
        return 'END Fee Balance not available.';
      }
      const date = new Date(balance.datePosted);
      const formattedDate = date.toLocaleDateString('en-GB');

      return (
        `END Fee Balance\n\n` +
        `Student: ${balance.studentName}\n` +
        `Adm No: ${balance.adm}\n` +
        `Class: ${balance.class}\n` +
        `Balance: Ksh.${balance.feeBalance.toLocaleString()}\n` +
        `Updated: ${formattedDate}`
      );
    }

    // Multiple students - this shouldn't happen after student selection
    let response = 'CON ';
    balances.forEach((balance) => {
      response += `${balance.studentName}: Ksh.${balance.feeBalance.toLocaleString()}\n`;
    });
    response += '0:Back';

    return response;
  }

  formatFeeStructureForUssd(structure: FeeStructureDto | null): string {
    if (!structure) {
      return 'END Fee Structure not available at the moment.';
    }

    return (
      `END Fee Structure\n\n${structure.schoolName}\n${structure.class}\n\n` +
      `Term 1: Ksh.${structure.term1.toLocaleString()}\n` +
      `Term 2: Ksh.${structure.term2.toLocaleString()}\n` +
      `Term 3: Ksh.${structure.term3.toLocaleString()}\n` +
      `Total: Ksh.${structure.total.toLocaleString()}`
    );
  }

  formatPaymentInstructionsForUssd(
    instructions: PaymentInstructionsDto | null,
  ): string {
    if (!instructions) {
      return 'END Payment details not available at the moment.';
    }

    return `END Payment Instructions\n\n${instructions.schoolName}\n\n${instructions.description}`;
  }
}
