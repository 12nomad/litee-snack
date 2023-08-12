import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsArray, IsNumber, IsString, Length } from 'class-validator';
import { Shared } from '../../common/entities/shared.entity';
import { Order } from '../../orders/entities/order.entity';
import { Shop } from '../../shops/entities/shop.entity';

@InputType('ChoiceInputType', { isAbstract: true })
@ObjectType()
export class Choice {
  @IsString()
  label: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  extra?: number | null;
}

@InputType('OptionInputType', { isAbstract: true })
@ObjectType()
export class Option {
  @IsString()
  label: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  extra?: number | null;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  quantity?: number | null;

  @Field(() => [Choice], { nullable: true })
  @IsArray()
  choices?: Choice[] | null;
}

@InputType('ProductInputType', { isAbstract: true })
@ObjectType()
export class Product extends Shared {
  @IsString()
  name: string;

  @IsString()
  @Length(12, 128)
  description: string;

  @Field({ nullable: true })
  @IsString()
  image?: string | null;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @IsNumber()
  shopId: number;

  @Field(() => Shop, { nullable: true })
  shop?: Shop | null;

  @Field(() => [Option], { nullable: true })
  options?: Prisma.JsonValue | null;

  @Field(() => [Order], { nullable: true })
  orders?: Order[] | null;
}
