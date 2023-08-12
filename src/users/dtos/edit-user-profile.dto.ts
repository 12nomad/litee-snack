import { InputType, PickType, PartialType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class EditUserProfileDto extends PickType(PartialType(User), [
  'email',
  'image',
  'name',
]) {
  @Field()
  @IsString()
  @IsEmail()
  prevEmail: string;
}
