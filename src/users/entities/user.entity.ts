import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Shared } from '../../common/entities/shared.entity';
import { Role } from '../../common/enums/role.enum';
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Verification } from './verification.entity';
import { Order } from '../../orders/entities/order.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
export class User extends Shared {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  stripeCustomerId?: string | null;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  verified: boolean;

  @IsEnum(Role)
  @Field(() => Role)
  role: `${Role}`;

  @IsString()
  @Field(() => String, { nullable: true })
  image?: string | null;

  @Field(() => Verification, { nullable: true })
  verification?: Verification | null;

  @Field(() => [Order], { nullable: true })
  orders?: Order[] | null;

  @Field(() => [Order], { nullable: true })
  rides?: Order[] | null;
}
