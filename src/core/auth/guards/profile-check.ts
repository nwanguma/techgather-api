import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class ProfileCheckGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnprocessableEntityException('User not authenticated');
    }

    if (!user.profile?.title && !user?.profile.location) {
      throw new UnprocessableEntityException(
        'Please update your profile to proceed',
      );
    }

    return true;
  }
}
