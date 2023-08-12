import { ObjectType, Field } from '@nestjs/graphql';
import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Order } from './order.entity';

@ObjectType()
export class OrdersQueryOutput extends MutationOutput {
  @Field(() => [Order], { nullable: true })
  data?: Order[] | null;

  @Field({ nullable: true })
  totalPages?: number | null;

  @Field({ nullable: true })
  totalItems?: number | null;
}

@ObjectType()
export class OrderQueryOutput extends MutationOutput {
  @Field(() => Order, { nullable: true })
  data?: Order | null;
}
