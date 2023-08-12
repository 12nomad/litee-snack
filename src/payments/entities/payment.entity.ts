import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Shop } from '../../shops/entities/shop.entity';
import { PaymentType } from '../../common/enums/payment-type.enum';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
export class Payment {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => Date)
  @IsDate()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  updatedAt: Date;

  @Field(() => Float)
  @IsNumber()
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  stripePaymentIntentId?: string | null;

  @IsString()
  currency: string;

  @Field(() => PaymentStatus)
  @IsEnum(PaymentStatus)
  status: `${PaymentStatus}`;

  @Field(() => String)
  @IsEnum(PaymentType)
  type: `${PaymentType}`;

  @Field(() => String, { nullable: true })
  @IsNumber()
  promoDuration?: number | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => Order, { nullable: true })
  order?: Order | null;

  @Field(() => Shop, { nullable: true })
  shop?: Shop | null;
}
