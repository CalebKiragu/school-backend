import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService, UserInfo } from './auth.service';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  admissionNumber?: string;
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with phone number and admission number (2FA)',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Phone number not registered or invalid admission number',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ token: string; user: UserInfo }> {
    return this.authService.login(
      loginDto.phoneNumber,
      loginDto.admissionNumber,
    );
  }

  @Get('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  verify(@Request() req: { user: unknown }): { valid: boolean; user: unknown } {
    return {
      valid: true,
      user: req.user,
    };
  }
}
