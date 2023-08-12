import { InputType, PickType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@InputType()
export class CreateStripeUserDto extends PickType(User, ['email', 'name']) {}
