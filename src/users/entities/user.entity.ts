import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
