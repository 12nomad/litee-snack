import { Module } from '@nestjs/common';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

@Module({
  providers: [CategoriesResolver, CategoriesService]
})
export class CategoriesModule {}
