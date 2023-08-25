import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Shop } from './shop.entity';

@ObjectType()
export class ShopsQueryOutput extends MutationOutput {
  @Field(() => [Shop], { nullable: true })
  data?: Shop[] | null;

  @Field(() => Int, { nullable: true })
  totalPages?: number | null;

  @Field(() => Int, { nullable: true })
  totalItems?: number | null;
}

@ObjectType()
export class ShopQueryOutput extends MutationOutput {
  @Field(() => Shop, { nullable: true })
  data?: Shop | null;
}
