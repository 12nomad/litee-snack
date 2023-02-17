import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Shared } from '../../common/entities/shared.entity';
import { IsNumber, IsString } from 'class-validator';

@InputType({ isAbstract: true })
@ObjectType()
export class Verification extends Shared {
  @IsString()
  code: string;

  @Field(() => ID)
  @IsNumber()
  userId: number;
}
