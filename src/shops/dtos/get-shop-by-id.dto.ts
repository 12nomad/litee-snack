import { InputType, PickType } from '@nestjs/graphql';
import { Shop } from '../entities/shop.entity';

@InputType()
export class GetShopByIdDto extends PickType(Shop, ['id']) {}
