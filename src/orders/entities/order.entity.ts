import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Shared } from '../../common/entities/shared.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderItem } from './order-item.entity';

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
export class Order extends Shared {
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number | null;

  @Field(() => OrderStatus, { defaultValue: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status: `${OrderStatus}`;

  @Field(() => User, { nullable: true })
  customer?: User | null;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  customerId?: number | null;

  @Field(() => User, { nullable: true })
  driver?: User | null;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  driverId?: number | null;

  @Field(() => Shop, { nullable: true })
  shop?: Shop | null;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  shopId?: number | null;

  // FIXME:
  @Field(() => [OrderItem], { nullable: true })
  orderItems?: OrderItem[] | null;

  @Field(() => Payment, { nullable: true })
  payment?: Payment | null;

  @Field(() => String, { nullable: true })
  @IsString()
  paymentId?: string | null;
}
