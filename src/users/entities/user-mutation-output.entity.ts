import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserMutationOutput {
  @Field()
  success: boolean;
}
