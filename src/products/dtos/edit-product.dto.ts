import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Product } from '../entities/product.entity';

@InputType()
export class EditProductDto extends PickType(PartialType(Product), [
  'name',
  'description',
  'price',
  'options',
]) {
  @Field()
  @IsNumber()
  productId: number;
}
