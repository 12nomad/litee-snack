import { InputType, PickType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';

@InputType()
export class UpdatePasswordDto extends PickType(User, ['email', 'password']) {}
