import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllContactsUssdView } from '../school/entities/all-contacts-ussd.view';

export interface UserInfo {
  phoneNumber: string;
  schoolId: number;
  schoolName: string;
  name: string;
  category: string;
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
      console.log('Database connection error:', error.message);
    }

    // Demo/Test users for development (fallback)
    const demoUsers = [
      {
        phoneNumber: '+254724027217',
        schoolId: 35623105,
        schoolName: 'Sigalame Boys',
        name: 'Martin Wamalwa (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254728986084',
        schoolId: 35623105,
        schoolName: 'Sigalame Boys',
        name: 'Kevin Omondi (Parent)',
        category: 'Parent',
      },
      {
        phoneNumber: '+254715648891',
        schoolId: 35623105,
        schoolName: 'Sigalame Boys',
        name: 'MR WERE',
        category: 'Principal',
      },
      {
        phoneNumber: '+254714732457',
        schoolId: 35623105,
        schoolName: 'Sigalame Boys',
        name: 'JAMES KAMAU',
        category: 'Admin',
      },
      {
        phoneNumber: '+254123456789',
        schoolId: 35623105,
        schoolName: 'Demo School',
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
      'Phone number not registered. Try demo numbers: +254724027217, +254728986084, +254715648891, +254714732457, or +254123456789',
    );
  }

  async generateToken(user: UserInfo): Promise<string> {
    const payload = {
      phoneNumber: user.phoneNumber,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
    };

    return this.jwtService.sign(payload);
  }

  async login(phoneNumber: string): Promise<{ token: string; user: UserInfo }> {
    const user = await this.validatePhoneNumber(phoneNumber);
    const token = await this.generateToken(user);

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
