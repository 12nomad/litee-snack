import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthMutationOutput {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
}
