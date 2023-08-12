import { InputType, PickType } from '@nestjs/graphql';
import { Shop } from '../entities/shop.entity';

@InputType()
export class DeleteShopDto extends PickType(Shop, ['id']) {}
