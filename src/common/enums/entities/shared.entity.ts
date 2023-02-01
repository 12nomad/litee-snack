import { Field, ID } from '@nestjs/graphql';

export class Shared {
  @Field(() => ID)
  id: string;

  createdAt: Date;
  updatedAt: Date;
}
