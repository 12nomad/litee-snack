import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNumber, IsString, Length } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';
import { Shared } from '../../common/entities/shared.entity';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Payment } from '../../payments/entities/payment.entity';

@InputType('ShopInputType', { isAbstract: true })
@ObjectType()
export class Shop extends Shared {
  @IsString()
  @Length(2, 16)
  name: string;

  @IsString()
  @Length(6, 32)
  address: string;

  @Field(() => String, { nullable: true })
  @IsString()
  image?: string | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  isPromoted?: boolean | null;

  @Field(() => String, { nullable: true })
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
