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

  registerUssdService(
    registrationData: UssdRegistrationRequest,
  ): any {
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
    const { sessionId, phoneNumber, text } = request;

    this.logger.log(`USSD Request: ${phoneNumber} - Session: ${sessionId} - Text: "${text}"`);

    try {
      // Get or create session first (fast operation)
      const session = await this.getOrCreateSession(sessionId, phoneNumber);

      // Extract user response from text (last part after *)
      const textArray = text.split('*');
      const userResponse = textArray[textArray.length - 1]?.trim() || '';
      
      // If text is empty, this is the initial request
      const isInitialRequest = text === '';

      this.logger.log(`Session Level: ${session.level}, User Response: "${userResponse}", Initial: ${isInitialRequest}`);

      // For initial request, validate phone and show main menu
      if (isInitialRequest) {
        try {
          const user = await this.authService.validatePhoneNumber(phoneNumber);
          await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
          return this.buildMainMenu(user.schoolName);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Phone validation failed: ${errorMessage}`);
          return 'END Sorry, phone number is not registered in the system.';
        }
      }

      // For subsequent requests, process menu selection
      // Don't validate phone again - session already exists
      const schoolName = "SIGALAME BOYS' SENIOR SCHOOL"; // Default school name
      return await this.processMenuSelection(
        session,
        userResponse,
        schoolName,
        phoneNumber,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`USSD Error: ${errorMessage}`, errorStack);
      return 'END Service error. Please try again later.';
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

    this.logger.log(`Processing menu: Level=${level}, Response="${userResponse}"`);

    // Handle back navigation
    if (userResponse === '0') {
      await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
      return this.buildMainMenu(schoolName);
    }

    // Handle main menu selections (level 1)
    if (level === UssdLevel.MAIN_MENU || level === UssdLevel.INITIAL) {
      switch (userResponse) {
        case '1':
          // Fee Balance
          try {
            const feeBalances = await this.feeService.getFeeBalance(phoneNumber);
            return this.feeService.formatFeeBalanceForUssd(feeBalances);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Fee Balance Error: ${errorMessage}`);
            return 'END Fee Balance service temporarily unavailable.';
          }
          
        case '2':
          // Exam Results
          try {
            const examResults = await this.examService.getExamResults(phoneNumber);
            return this.examService.formatResultsForUssd(examResults);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Exam Results Error: ${errorMessage}`);
            return 'END Exam Results service temporarily unavailable.';
          }
          
        case '3':
          // Events
          try {
            const events = await this.eventService.getUpcomingEvents(phoneNumber);
            return this.eventService.formatEventsForUssd(events);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Events Error: ${errorMessage}`);
            return 'END Events service temporarily unavailable.';
          }
          
        case '4':
          // Fee Structure Menu
          await this.updateSessionLevel(sessionId, UssdLevel.FEE_STRUCTURE_MENU);
          return this.buildFeeStructureMenu();
          
        case '5':
          // Payment Instructions
          try {
            const paymentInstructions = await this.feeService.getPaymentInstructions(phoneNumber);
            return this.feeService.formatPaymentInstructionsForUssd(paymentInstructions);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Payment Instructions Error: ${errorMessage}`);
            return 'END Payment Details service temporarily unavailable.';
          }
          
        default:
          // Invalid selection - show menu again
          return this.buildMainMenu(schoolName);
      }
    }

    // Handle fee structure submenu (level 9)
    if (level === UssdLevel.FEE_STRUCTURE_MENU || level === 9) {
      switch (userResponse) {
        case '1':
        case '2':
        case '3':
        case '4':
          try {
            const className = `Form ${userResponse}`;
            const feeStructure = await this.feeService.getFeeStructure(phoneNumber, className);
            await this.updateSessionLevel(sessionId, UssdLevel.MAIN_MENU);
            return this.feeService.formatFeeStructureForUssd(feeStructure);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Fee Structure Error: ${errorMessage}`);
            return 'END Fee Structure service temporarily unavailable.';
          }
          
        default:
          // Invalid selection - show fee structure menu again
          return this.buildFeeStructureMenu();
      }
    }

    // Default fallback - show main menu
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
