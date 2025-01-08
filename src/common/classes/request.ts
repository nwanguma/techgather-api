import { Request } from 'express';
import { User } from '../../core/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
