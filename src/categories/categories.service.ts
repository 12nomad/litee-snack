import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getCategoryShopsDto } from './dtos/get-category-shops.dto';
import {
  CategoriesQueryOutput,
  CategoryQueryOutput,
} from './entities/category-query-output.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(): Promise<CategoriesQueryOutput> {
    try {
      const categories = await this.prisma.category.findMany({
        include: { _count: { select: { shops: true } } },
      });
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }

  async getCategoryShops({
    slug,
    page,
  }: getCategoryShopsDto): Promise<CategoryQueryOutput> {
    try {
      const [category, count] = await this.prisma.$transaction([
        this.prisma.category.findUnique({
          where: { slug },
          include: {
            shops: {
              take: 10,
              skip: (page - 1) * 10,
              // FIXME:
              orderBy: { isPromoted: 'desc' },
            },
            _count: { select: { shops: true } },
          },
        }),
        this.prisma.shop.count({ where: { categories: { every: { slug } } } }),
      ]);
      return {
        success: true,
        data: category,
        totalPages: Math.ceil(count / 10),
        totalItems: count,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }
}
