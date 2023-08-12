import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@InputType()
export class AcceptNewOrderDto extends PickType(Order, ['id', 'status']) {}
