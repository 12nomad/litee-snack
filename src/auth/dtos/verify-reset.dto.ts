import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

import { User } from '../../users/entities/user.entity';

@InputType()
export class VerifyResetDto extends PickType(User, ['email']) {
  @Field()
  @IsString()
  reset: string;
}
