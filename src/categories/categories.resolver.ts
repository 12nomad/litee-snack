import { Args, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CategoriesQueryOutput,
  CategoryQueryOutput,
} from './entities/category-query-output.entity';
import { CategoriesService } from './categories.service';
import { getCategoryShopsDto } from './dtos/get-category-shops.dto';

@Resolver()
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @ResolveField('count', () => Int)
  // shopCount(@Parent() category: Category): number {return this.categoriesService.getCount(category)}

  @Roles(['PUBLIC'])
  @Query(() => CategoriesQueryOutput, { name: 'getCategories' })
  async getCategories(): Promise<CategoriesQueryOutput> {
    return this.categoriesService.getCategories();
  }

  @Roles(['PUBLIC'])
  @Query(() => CategoryQueryOutput, { name: 'getCategoryShops' })
  async getCategoryShops(
    @Args('getCategoryShopsInput')
    getCategoryShopsInput: getCategoryShopsDto,
  ): Promise<CategoryQueryOutput> {
    return this.categoriesService.getCategoryShops(getCategoryShopsInput);
  }
}
