import { ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class UserQueryOutput {
  success: boolean;
  data: User | null;
}
