import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UssdService } from './ussd.service';

export interface UssdRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface UssdRegistrationRequest {
  shortCode: string;
  callbackUrl: string;
  description?: string;
}

export interface UssdWebhookRequest extends UssdRequest {
  // Additional fields that might be sent by the provider
  networkCode?: string;
  cost?: string;
  date?: string;
}

@ApiTags('USSD')
@Controller('ussd')
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post()
  @ApiOperation({
    summary: 'Register USSD service with provider',
    description:
      "Endpoint for registering USSD short codes with telecom providers like Africa's Talking",
  })
  @ApiBody({
    description: 'USSD registration details',
    schema: {
      type: 'object',
      properties: {
        shortCode: { type: 'string', example: '*123#' },
        callbackUrl: {
          type: 'string',
          example: 'https://api.example.com/ussd/webhook',
        },
        description: {
          type: 'string',
          example: 'School Management System USSD Service',
        },
      },
      required: ['shortCode', 'callbackUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'USSD service registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async registerUssdService(
    @Body() registrationData: UssdRegistrationRequest,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const result =
        await this.ussdService.registerUssdService(registrationData);
      return {
        success: true,
        message: 'USSD service registered successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to register USSD service',
      };
    }
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Handle USSD webhook requests',
    description:
      'Webhook endpoint for receiving USSD session data from telecom providers',
  })
  @ApiBody({
    description: 'USSD session data from provider',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'ATUid_12345' },
        serviceCode: { type: 'string', example: '*123#' },
        phoneNumber: { type: 'string', example: '+254712345678' },
        text: { type: 'string', example: '1*2' },
        networkCode: { type: 'string', example: '63902' },
        cost: { type: 'string', example: 'KES 0.00' },
        date: { type: 'string', example: '2024-01-01 12:00:00' },
      },
      required: ['sessionId', 'serviceCode', 'phoneNumber', 'text'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'USSD response',
    schema: {
      type: 'string',
      example:
        'CON Welcome to School Management System\n1. Check Fee Balance\n2. View Exam Results',
    },
  })
  async handleUssdWebhook(
    @Body() body: UssdWebhookRequest,
    @Headers() headers: Record<string, string>,
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('USSD Webhook Request:', {
        body,
        headers,
        timestamp: new Date().toISOString()
      });

      // Validate required fields
      if (!body.sessionId || !body.phoneNumber) {
        console.error('Missing required fields:', body);
        return 'END Invalid request. Missing required fields.';
      }

      // Process the USSD request
      const response = await this.ussdService.handleUssdRequest(body);
      
      const duration = Date.now() - startTime;
      console.log(`USSD Response (${duration}ms):`, response);
      
      // Ensure response is within 10 second limit
      if (duration > 9000) {
        console.warn(`USSD response took ${duration}ms - approaching timeout!`);
      }
      
      return response;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`USSD webhook error (${duration}ms):`, errorMessage);
      return 'END Service temporarily unavailable. Please try again later.';
    }
  }
}
