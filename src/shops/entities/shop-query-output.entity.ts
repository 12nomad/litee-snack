import { ObjectType, Field } from '@nestjs/graphql';
import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Shop } from './shop.entity';

@ObjectType()
export class ShopsQueryOutput extends MutationOutput {
  @Field(() => [Shop], { nullable: true })
  data?: Shop[] | null;

  @Field({ nullable: true })
  totalPages?: number | null;

  @Field({ nullable: true })
  totalItems?: number | null;
}

@ObjectType()
export class ShopQueryOutput extends MutationOutput {
  @Field(() => Shop, { nullable: true })
  data?: Shop | null;
}
