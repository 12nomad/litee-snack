import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationOutput {
  success: boolean;
}
