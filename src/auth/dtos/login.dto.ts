import { InputType, PickType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@InputType()
export class LoginDto extends PickType(User, ['email', 'password']) {}
