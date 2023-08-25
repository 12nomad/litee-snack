import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MutationOutput } from '../../common/entities/mutation-output.entity';
import { Category } from './category.entity';

@ObjectType()
export class CategoriesQueryOutput extends MutationOutput {
  @Field(() => [Category], { nullable: true })
  data?: Category[] | null;
}

@ObjectType()
export class CategoryQueryOutput extends MutationOutput {
  @Field(() => Category, { nullable: true })
  data?: Category | null;

  @Field(() => Int, { nullable: true })
  totalPages?: number | null;

  @Field(() => Int, { nullable: true })
  totalItems?: number | null;
}
