import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

import { Payment } from '../entities/payment.entity';
import { MutationOutput } from '../../common/entities/mutation-output.entity';

@InputType()
export class CreatePromotionPaymentIntentDto extends PickType(Payment, [
  'stripePaymentIntentId',
  'amount',
]) {
  @Field()
  @IsNumber()
  shopId: number;

  @Field()
  @IsNumber()
  promoDuration: number;

  @Field()
  @IsString()
  stripeCustomerId: string;
}

// TODO: OUTPUT
@ObjectType()
class PaymentIntent {
  @Field()
  @IsString()
  clientSecret: string;

  @Field()
  @IsString()
  paymentIntent: string;
}

@ObjectType()
export class CreatePromotionPaymentIntentOutput extends MutationOutput {
  @Field(() => PaymentIntent, { nullable: true })
  data?: PaymentIntent | null;
}
