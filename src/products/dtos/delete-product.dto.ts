import { InputType, PickType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';

@InputType()
export class DeleteProductDto extends PickType(Product, ['id']) {}
