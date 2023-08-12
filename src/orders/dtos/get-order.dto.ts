import { InputType, PickType } from '@nestjs/graphql';
import {} from 'class-validator';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderDto extends PickType(Order, ['id']) {}
