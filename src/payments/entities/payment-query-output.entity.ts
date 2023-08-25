import { ObjectType, Field, Int } from '@nestjs/graphql';

import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Payment } from './payment.entity';

@ObjectType()
export class PaymentsQueryOutput extends MutationOutput {
  @Field(() => [Payment], { nullable: true })
  data?: Payment[] | null;

  @Field(() => Int, { nullable: true })
  totalPages?: number | null;

  @Field(() => Int, { nullable: true })
  totalItems?: number | null;
}

@ObjectType()
export class PaymentQueryOutput extends MutationOutput {
  @Field(() => Payment, { nullable: true })
  data?: Payment | null;
}
