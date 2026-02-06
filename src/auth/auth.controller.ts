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
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with phone number' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Phone number not registered' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ token: string; user: UserInfo }> {
    return this.authService.login(loginDto.phoneNumber);
  }

  @Get('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verify(@Request() req): Promise<{ valid: boolean; user: any }> {
    return {
      valid: true,
      user: req.user,
    };
  }
}
