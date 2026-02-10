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

    // Additional admin users
    if (normalizedPhone === '+254720613991') {
      return {
        phoneNumber: normalizedPhone,
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Didimo Mukati (Principal)',
        category: 'Principal',
        isAdmin: true,
      };
    }

    if (normalizedPhone === '+254742218359') {
      return {
        phoneNumber: normalizedPhone,
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Wandera Mofati (Admin)',
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
      // New students
      {
        phoneNumber: '+254701234567',
        admissionNumber: '12077',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Xavier Kelvin (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254702345678',
        admissionNumber: '11586',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'David Bwire (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254703456789',
        admissionNumber: '12047',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Dybal Angoya (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254704567890',
        admissionNumber: '12668',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Raymond Mandoli (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254705678901',
        admissionNumber: '11569',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Willingtone Ojambo (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254706789012',
        admissionNumber: '12643',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Allan Sembu (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254707890123',
        admissionNumber: '12701',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Deogracious Wando (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254708901234',
        admissionNumber: '11831',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Aine Wesonga (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254709012345',
        admissionNumber: '11168',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Vincent Owen (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254710123456',
        admissionNumber: '11789',
        schoolId: 35609104,
        schoolName: "SIGALAME BOYS' SENIOR SCHOOL",
        name: 'Prince Joel (Parent)',
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
      'Phone number not registered. Try demo numbers: +254724027217, +254728986084, +254715648891, +254714732457, +254123456789, or new students: +254701234567 to +254710123456. Admin: +254748944951, +254720613991, +254742218359',
    );
  }

  validateAdmissionNumber(
    phoneNumber: string,
    admissionNumber: string,
  ): boolean {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Admin login check
    if (
      (normalizedPhone === '+254748944951' ||
        normalizedPhone === '+254720613991' ||
        normalizedPhone === '+254742218359') &&
      admissionNumber === '35609104'
    ) {
      return true;
    }

    // Demo users validation
    const demoUsers = [
      { phoneNumber: '+254724027217', admissionNumber: '58641' },
      { phoneNumber: '+254728986084', admissionNumber: '58642' },
      { phoneNumber: '+254715648891', admissionNumber: '58643' },
      { phoneNumber: '+254714732457', admissionNumber: '58644' },
      { phoneNumber: '+254123456789', admissionNumber: '58645' },
      // New students
      { phoneNumber: '+254701234567', admissionNumber: '12077' },
      { phoneNumber: '+254702345678', admissionNumber: '11586' },
      { phoneNumber: '+254703456789', admissionNumber: '12047' },
      { phoneNumber: '+254704567890', admissionNumber: '12668' },
      { phoneNumber: '+254705678901', admissionNumber: '11569' },
      { phoneNumber: '+254706789012', admissionNumber: '12643' },
      { phoneNumber: '+254707890123', admissionNumber: '12701' },
      { phoneNumber: '+254708901234', admissionNumber: '11831' },
      { phoneNumber: '+254709012345', admissionNumber: '11168' },
      { phoneNumber: '+254710123456', admissionNumber: '11789' },
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
