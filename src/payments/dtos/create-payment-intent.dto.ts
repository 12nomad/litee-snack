import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentIntentDto extends PickType(Payment, [
  'stripePaymentIntentId',
]) {
  @Field()
  @IsNumber()
  orderId: number;

  @Field()
  @IsString()
  stripeCustomerId: string;
}
