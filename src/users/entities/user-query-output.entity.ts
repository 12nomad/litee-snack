import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class UserQueryOutput {
  @Field()
  success: boolean;
  @Field(() => User, { nullable: true })
  data: User | null;
}
