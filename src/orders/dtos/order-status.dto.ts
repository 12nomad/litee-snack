import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@InputType()
export class OrderStatusDto extends PickType(Order, ['id']) {}
