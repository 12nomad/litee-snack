import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsArray, ArrayMinSize } from 'class-validator';
import { Shop } from '../entities/shop.entity';

@InputType()
export class CreateShopDto extends PickType(Shop, [
  'name',
  'address',
  'image',
]) {
  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  category: string[];
}
