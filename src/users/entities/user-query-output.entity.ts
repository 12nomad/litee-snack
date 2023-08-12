import { ObjectType, Field } from '@nestjs/graphql';
import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { User } from './user.entity';

@ObjectType()
export class UserQueryOutput extends MutationOutput {
  @Field(() => User, { nullable: true })
  data: Partial<User> | null;
}
