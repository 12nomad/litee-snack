import { ObjectType, Field } from '@nestjs/graphql';

import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Payment } from './payment.entity';

@ObjectType()
export class PaymentsQueryOutput extends MutationOutput {
  @Field(() => [Payment], { nullable: true })
  data?: Payment[] | null;

  @Field({ nullable: true })
  totalPages?: number | null;

  @Field({ nullable: true })
  totalItems?: number | null;
}

@ObjectType()
export class PaymentQueryOutput extends MutationOutput {
  @Field(() => Payment, { nullable: true })
  data?: Payment | null;
}
