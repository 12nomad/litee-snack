import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsNumber } from 'class-validator';
import { OrderChoice } from '../entities/order-item.entity';
import { MutationOutput } from '../../common/entities/mutation-output.entity';

@InputType('OrderOptionInputType', { isAbstract: true })
@ObjectType()
class OrderOption {
  @Field()
  @IsNumber()
  productId: number;

  @Field()
  @IsNumber()
  quantity: number;

  @Field(() => [OrderChoice], { nullable: true })
  orderChoices?: Prisma.JsonValue;
}

@InputType()
export class CreateOrderDto {
  @Field()
  @IsNumber()
  shopId: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  orderId?: number | null;

  @Field(() => [OrderOption])
  orderOptions: OrderOption[];
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  orderId?: number | null;
}
