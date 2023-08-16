import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrdersDto extends PartialType(
  PickType(Order, ['status', 'shopId']),
) {
  @Field({ defaultValue: 1 })
  @IsNumber()
  page?: number;
}
