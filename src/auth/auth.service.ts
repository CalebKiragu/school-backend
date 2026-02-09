import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllContactsUssdView } from '../school/entities/all-contacts-ussd.view';

export interface UserInfo {
  phoneNumber: string;
  admissionNumber?: string;
  schoolCode?: string;
  schoolId: number;
  schoolName: string;
  name: string;
  category: string;
  isAdmin?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AllContactsUssdView)
    private readonly contactsRepository: Repository<AllContactsUssdView>,
    private readonly jwtService: JwtService,
  ) {}

  async validatePhoneNumber(phoneNumber: string): Promise<UserInfo> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    try {
      const contact = await this.contactsRepository.findOne({
        where: [{ phone1: normalizedPhone }, { phone2: normalizedPhone }],
      });

      if (contact) {
        return {
          phoneNumber: normalizedPhone,
          schoolId: contact.schoolId,
          schoolName: contact.schoolName,
          name: contact.name,
          category: contact.category,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database connection error:', errorMessage);
    }

    // Admin login check
    if (normalizedPhone === '+254748944951') {
      return {
        phoneNumber: normalizedPhone,
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'School Administrator',
        category: 'Admin',
        isAdmin: true,
      };
    }

    // Demo/Test users for development (fallback)
    const demoUsers = [
      {
        phoneNumber: '+254724027217',
        admissionNumber: '58641',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Martin Wamalwa (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254728986084',
        admissionNumber: '58642',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Kevin Omondi (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254715648891',
        admissionNumber: '58643',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'MR WERE',
        category: 'Principal',
      },
      {
        phoneNumber: '+254714732457',
        admissionNumber: '58644',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'JAMES KAMAU',
        category: 'Admin',
      },
      {
        phoneNumber: '+254123456789',
        admissionNumber: '58645',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Demo User',
        category: 'Parent',
      },
    ];

    // Check if it's a demo user
    const demoUser = demoUsers.find(
      (user) => user.phoneNumber === normalizedPhone,
    );
    if (demoUser) {
      return demoUser;
    }

    throw new UnauthorizedException(
      'Phone number not registered. Try demo numbers: +254724027217, +254728986084, +254715648891, +254714732457, or +254123456789. Admin: +254748944951',
    );
  }

  validateAdmissionNumber(
    phoneNumber: string,
    admissionNumber: string,
  ): boolean {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Admin login check
    if (normalizedPhone === '+254748944951' && admissionNumber === '35609104') {
      return true;
    }

    // Demo users validation
    const demoUsers = [
      { phoneNumber: '+254724027217', admissionNumber: '58641' },
      { phoneNumber: '+254728986084', admissionNumber: '58642' },
      { phoneNumber: '+254715648891', admissionNumber: '58643' },
      { phoneNumber: '+254714732457', admissionNumber: '58644' },
      { phoneNumber: '+254123456789', admissionNumber: '58645' },
    ];

    const demoUser = demoUsers.find(
      (user) =>
        user.phoneNumber === normalizedPhone &&
        user.admissionNumber === admissionNumber,
    );

    return !!demoUser;
  }

  generateToken(user: UserInfo): string {
    const payload = {
      phoneNumber: user.phoneNumber,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
    };

    return this.jwtService.sign(payload);
  }

  async login(
    phoneNumber: string,
    admissionNumber?: string,
  ): Promise<{ token: string; user: UserInfo }> {
    const user = await this.validatePhoneNumber(phoneNumber);

    // If admission number is provided, validate it
    if (admissionNumber) {
      const isValid = this.validateAdmissionNumber(
        phoneNumber,
        admissionNumber,
      );
      if (!isValid) {
        throw new UnauthorizedException(
          'Invalid admission number for this phone number',
        );
      }
    }

    const token = this.generateToken(user);

    return { token, user };
  }

  normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const normalized = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (normalized.startsWith('254')) {
      return `+${normalized}`;
    } else if (normalized.startsWith('0')) {
      return `+254${normalized.substring(1)}`;
    } else if (normalized.length === 9) {
      return `+254${normalized}`;
    }

    return `+${normalized}`;
  }
}
