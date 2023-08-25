import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { Shared } from '../../common/entities/shared.entity';
import { Product } from '../../products/entities/product.entity';

@InputType('OrderChoiceInputType', { isAbstract: true })
@ObjectType()
export class OrderChoice {
  @IsString()
  label: string;

  @IsNumber()
  quantity: number;

  @Field(() => String, { nullable: true })
  choice?: string | null;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
export class OrderItem extends Shared {
  @Field(() => Product, { nullable: true })
  product?: Product | null;

  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @Field(() => [OrderChoice], { nullable: true })
  orderChoices?: Prisma.JsonValue;
}
