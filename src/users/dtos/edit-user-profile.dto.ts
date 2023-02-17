import { InputType, PickType, PartialType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@InputType()
export class EditUserProfileDto extends PickType(PartialType(User), [
  'email',
  'password',
]) {}
