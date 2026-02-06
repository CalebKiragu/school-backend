import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UssdRequest, UssdRegistrationRequest } from './ussd.controller';
import { SessionLevel } from './entities/session-level.entity';
import { AuthService } from '../auth/auth.service';
import { FeeService } from '../fee/fee.service';
import { ExamService } from '../exam/exam.service';
import { EventService } from '../event/event.service';

export enum UssdLevel {
  INITIAL = 0,
  MAIN_MENU = 1,
  FEE_STRUCTURE_MENU = 9,
}

@Injectable()
export class UssdService {
  private readonly logger = new Logger(UssdService.name);

  constructor(
    @InjectRepository(SessionLevel)
    private readonly sessionRepository: Repository<SessionLevel>,
    private readonly authService: AuthService,
    private readonly feeService: FeeService,
    private readonly examService: ExamService,
    private readonly eventService: EventService,
  ) {}

  async registerUssdService(
    registrationData: UssdRegistrationRequest,
  ): Promise<any> {
    const { shortCode, callbackUrl, description } = registrationData;

    this.logger.log(
      `USSD Registration Request: ${shortCode} -> ${callbackUrl}`,
    );

    try {
      // Validate the registration data
      if (!shortCode || !callbackUrl) {
        throw new Error('Short code and callback URL are required');
      }

      // Validate short code format (should be like *123# or *123*1#)
      const shortCodePattern = /^\*\d+(\*\d+)*#$/;
      if (!shortCodePattern.test(shortCode)) {
        throw new Error(
          'Invalid short code format. Expected format: *123# or *123*1#',
        );
      }

      // Validate callback URL
      try {
        new URL(callbackUrl);
      } catch {
        throw new Error('Invalid callback URL format');
      }

      // For Africa's Talking integration, you would typically make an API call here
      // to register the USSD code with their service
      // Example: await this.registerWithAfricasTalking(shortCode, callbackUrl);

      // For now, we'll just log the registration and return success
      const registrationResult = {
        shortCode,
        callbackUrl,
        description: description || 'School Management System USSD Service',
        status: 'registered',
        registeredAt: new Date().toISOString(),
        provider: "Africa's Talking",
        webhookEndpoint: `${callbackUrl}/webhook`,
      };

      this.logger.log(
        `USSD Service registered successfully: ${JSON.stringify(registrationResult)}`,
      );

      return registrationResult;
    } catch (error) {
      this.logger.error(
        `USSD Registration Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleUssdRequest(request: UssdRequest): Promise<string> {
    const { sessionId, serviceCode, phoneNumber, text } = request;

    this.logger.log(`USSD Request: ${phoneNumber} - ${text}`);

    try {
      // Validate phone number first
      const user = await this.authService.validatePhoneNumber(phoneNumber);

      // Get or create session
      const session = await this.getOrCreateSession(sessionId, phoneNumber);

      // Extract user response from text (last part after *)
      const textArray = text.split('*');
      const userResponse = textArray[textArray.length - 1]?.trim() || '';

      // Handle menu navigation based on session level
      return await this.processMenuSelection(
        session,
        userResponse,
        user.schoolName,
        phoneNumber,
      );
    } catch (error) {
      this.logger.error(`USSD Error: ${error.message}`, error.stack);
      return 'END Sorry, phone number is not registered in the system.';
    }
  }

  private async getOrCreateSession(
    sessionId: string,
    phoneNumber: string,
  ): Promise<SessionLevel> {
    let session = await this.sessionRepository.findOne({
      where: { sessionId },
    });

    if (!session) {
      session = this.sessionRepository.create({
        sessionId,
        phoneNumber,
        level: UssdLevel.INITIAL,
      });
      await this.sessionRepository.save(session);
    }

    return session;
  }

  private async updateSessionLevel(
    sessionId: string,
    level: number,
  ): Promise<void> {
    await this.sessionRepository.update({ sessionId }, { level });
  }

  private async processMenuSelection(
    session: SessionLevel,
    userResponse: string,
    schoolName: string,
    phoneNumber: string,
  ): Promise<string> {
    const { sessionId, level } = session;

    // Handle main menu (levels 0 and 1)
    if (level === UssdLevel.INITIAL || level === UssdLevel.MAIN_MENU) {
      switch (userResponse) {
        case '1':
          if (level === UssdLevel.MAIN_MENU) {
            try {
              const feeBalances =
                await this.feeService.getFeeBalance(phoneNumber);
              await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
              return this.feeService.formatFeeBalanceForUssd(feeBalances);
            } catch (error) {
              this.logger.error(`Fee Balance Error: ${error.message}`);
              return 'CON Fee Balance service temporarily unavailable\n0:Back';
            }
          }
          break;
        case '2':
          if (level === UssdLevel.MAIN_MENU) {
            try {
              const examResults =
                await this.examService.getExamResults(phoneNumber);
              await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
              return this.examService.formatResultsForUssd(examResults);
            } catch (error) {
              this.logger.error(`Exam Results Error: ${error.message}`);
              return 'CON Exam Results service temporarily unavailable\n0:Back';
            }
          }
          break;
        case '3':
          if (level === UssdLevel.MAIN_MENU) {
            try {
              const events =
                await this.eventService.getUpcomingEvents(phoneNumber);
              await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
              return this.eventService.formatEventsForUssd(events);
            } catch (error) {
              this.logger.error(`Events Error: ${error.message}`);
              return 'CON Events service temporarily unavailable\n0:Back';
            }
          }
          break;
        case '4':
          if (level === UssdLevel.MAIN_MENU) {
            await this.updateSessionLevel(
              sessionId,
              UssdLevel.FEE_STRUCTURE_MENU,
            );
            return this.buildFeeStructureMenu();
          }
          break;
        case '5':
          if (level === UssdLevel.MAIN_MENU) {
            try {
              const paymentInstructions =
                await this.feeService.getPaymentInstructions(phoneNumber);
              await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
              return this.feeService.formatPaymentInstructionsForUssd(
                paymentInstructions,
              );
            } catch (error) {
              this.logger.error(`Payment Instructions Error: ${error.message}`);
              return 'CON Payment Details service temporarily unavailable\n0:Back';
            }
          }
          break;
        case '0':
          await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
          return this.buildMainMenu(schoolName);
        default:
          await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
          return this.buildMainMenu(schoolName);
      }
    }

    // Handle fee structure submenu (level 9)
    if (level === UssdLevel.FEE_STRUCTURE_MENU) {
      switch (userResponse) {
        case '1':
        case '2':
        case '3':
        case '4':
          try {
            const className = `Form ${userResponse}`;
            const feeStructure = await this.feeService.getFeeStructure(
              phoneNumber,
              className,
            );
            await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
            return this.feeService.formatFeeStructureForUssd(feeStructure);
          } catch (error) {
            this.logger.error(`Fee Structure Error: ${error.message}`);
            return 'CON Fee Structure service temporarily unavailable\n0:Back';
          }
        case '0':
          await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
          return this.buildMainMenu(schoolName);
        default:
          return this.buildFeeStructureMenu();
      }
    }

    // Default fallback
    await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
    return this.buildMainMenu(schoolName);
  }

  private buildMainMenu(schoolName: string = 'School'): string {
    return (
      `CON Welcome to ${schoolName}\nChoose option.\n` +
      '1. Fee Balance\n' +
      '2. Exam Results\n' +
      '3. News and Events\n' +
      '4. Fee Structure\n' +
      '5. Payment Details'
    );
  }

  private buildFeeStructureMenu(): string {
    return (
      'CON Choose Class\n' +
      '1. Form 1\n' +
      '2. Form 2\n' +
      '3. Form 3\n' +
      '4. Form 4\n' +
      '0:Back'
    );
  }
}
