import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Shared } from '../../common/entities/shared.entity';
import { Shop } from '../../shops/entities/shop.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
export class Category extends Shared {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @Field(() => String, { nullable: true })
  @IsString()
  image: string | null;

  @Field(() => [Shop], { nullable: true })
  shops?: Shop[] | null;
}
