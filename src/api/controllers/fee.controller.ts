import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  FeeService,
  FeeBalanceDto,
  FeeStructureDto,
  PaymentInstructionsDto,
} from '../../fee/fee.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('api/fees')
@UseGuards(AuthGuard('jwt'))
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get fee balance for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Fee balance retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFeeBalance(@Request() req): Promise<FeeBalanceDto[]> {
    const phoneNumber = req.user.phoneNumber;
    return this.feeService.getFeeBalance(phoneNumber);
  }

  @Get('structure/:class')
  @ApiOperation({ summary: 'Get fee structure for a specific class' })
  @ApiParam({ name: 'class', description: 'Class name (e.g., Form 1, Form 2)' })
  @ApiResponse({
    status: 200,
    description: 'Fee structure retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Fee structure not found' })
  async getFeeStructure(
    @Param('class') className: string,
    @Request() req,
  ): Promise<FeeStructureDto | null> {
    const phoneNumber = req.user.phoneNumber;
    return this.feeService.getFeeStructure(phoneNumber, className);
  }

  @Get('payment-instructions')
  @ApiOperation({ summary: 'Get payment instructions for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Payment instructions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentInstructions(
    @Request() req,
  ): Promise<PaymentInstructionsDto | null> {
    const phoneNumber = req.user.phoneNumber;
    return this.feeService.getPaymentInstructions(phoneNumber);
  }
}
