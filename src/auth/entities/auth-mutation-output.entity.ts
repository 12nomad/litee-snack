import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthMutationOutput {
  @Field()
  success: boolean;
}
