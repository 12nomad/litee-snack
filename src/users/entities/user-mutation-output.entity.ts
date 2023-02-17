import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserMutationOutput {
  success: boolean;
}
