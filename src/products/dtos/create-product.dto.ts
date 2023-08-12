import { InputType, PickType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';

@InputType()
export class CreateProductDto extends PickType(Product, [
  'name',
  'description',
  'shopId',
  'price',
  'options',
  'image',
]) {}
