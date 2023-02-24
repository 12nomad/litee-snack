import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';

@InputType({ isAbstract: true })
@ObjectType()
export class Shared {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
