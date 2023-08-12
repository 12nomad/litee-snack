import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Shared } from '../../common/entities/shared.entity';
import { IsNumber, IsString } from 'class-validator';
import { User } from './user.entity';

@InputType('VerificationInputType', { isAbstract: true })
@ObjectType()
export class Verification extends Shared {
  @IsString()
  @Field(() => String, { nullable: true })
  code?: string | null;

  @IsString()
  @Field(() => String, { nullable: true })
  reset?: string | null;

  @Field(() => User)
  user: User;

  // @Field(() => Int, { nullable: true })
  @IsNumber()
  userId: number;
}
