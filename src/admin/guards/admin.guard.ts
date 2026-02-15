import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

interface RequestWithUser {
  user?: {
    phoneNumber?: string;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminPhones = [
    '+254720613991', // Principal
    '+254748944951', // Wandera (Admin)
    '+254742218359', // Admin User
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.phoneNumber) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!this.adminPhones.includes(user.phoneNumber)) {
      throw new UnauthorizedException('Admin access required');
    }

    return true;
  }
}
