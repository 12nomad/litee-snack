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

@InputType({ isAbstract: true })
@ObjectType()
export class User extends Shared {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;

  @Field()
  @IsBoolean()
  verified: boolean;

  @IsEnum(Role)
  @Field(() => Role)
  role: `${Role}`;
}
