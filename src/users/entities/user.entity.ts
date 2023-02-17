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
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  verified: boolean;

  @IsEnum(Role)
  @Field(() => Role)
  role: `${Role}`;
}
