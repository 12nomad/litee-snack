import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CreateShopDto } from './create-shop.dto';

@InputType()
export class EditShopDto extends PartialType(CreateShopDto) {
  @Field()
  @IsNumber()
  shopId: number;
}
