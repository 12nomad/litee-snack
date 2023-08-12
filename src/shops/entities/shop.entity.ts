import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';
import { Shared } from '../../common/entities/shared.entity';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Payment } from '../../payments/entities/payment.entity';

@InputType('ShopInputType', { isAbstract: true })
@ObjectType()
export class Shop extends Shared {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @Field({ nullable: true })
  @IsString()
  image?: string | null;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  isPromoted?: boolean | null;

  @Field({ nullable: true })
  @IsString()
  promotedUntil?: string | null;

  @IsNumber()
  ownerId: number;

  @Field(() => [Category], { nullable: true })
  categories?: Category[] | null;

  @Field(() => [Product], { nullable: true })
  products?: Product[] | null;

  @Field(() => [Order], { nullable: true })
  orders?: Order[] | null;

  @Field(() => Payment, { nullable: true })
  payment?: Payment | null;
}
