import { InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';

@InputType('SharedInputType', { isAbstract: true })
@ObjectType()
export class Shared {
  @IsNumber()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
