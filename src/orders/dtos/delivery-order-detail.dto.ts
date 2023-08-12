import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@InputType()
export class DeliveryOrderDetailDto extends PickType(Order, ['id']) {}
