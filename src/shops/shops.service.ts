import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dtos/create-shop.dto';
import { DeleteShopDto } from './dtos/delete-shop.dto';
import { EditShopDto } from './dtos/edit-shop.dto';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import {
  ShopQueryOutput,
  ShopsQueryOutput,
} from './entities/shop-query-output.entity';
import { GetShopsDto } from './dtos/get-shops.dto';
import { GetShopByIdDto } from './dtos/get-shop-by-id.dto';
import { GetShopByNameDto } from './dtos/get-shop-by-name.dto';
import { GetOwnerIndividualShopDto } from './dtos/get-owner-individual-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: utils
  getCategoryNameAndSlug(name: string) {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    return { categoryName, categorySlug };
  }

  // TODO: Services
  async createShop(
    { name, address, category, image }: CreateShopDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    try {
      // const { categoryName, categorySlug } =
      //   this.getCategoryNameAndSlug(category);

      await this.prisma.shop.create({
        data: {
          name,
          address,
          ownerId,
          image,
          categories: {
            // connectOrCreate: {
            //   where: {
            //     slug: category.map(slug => ({slug}))
            //   },
            //   create: {
            //     name: categoryName,
            //     slug: categorySlug,
            //   },
            // },
            connect: category.map((slug) => ({ slug })),
          },
        },
      });
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }

  async editShop(
    { shopId, name, address, category, image }: EditShopDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) throw new NotFoundException('Shop not found...');

    if (shop.ownerId !== ownerId)
      throw new ForbiddenException(
        'You have no permission to edit the shop...',
      );

    if (category) {
      // const { categoryName, categorySlug } =
      //   this.getCategoryNameAndSlug(category);

      await this.prisma.shop.update({
        where: { id: shop.id },
        data: {
          name,
          address,
          image,
          categories: {
            // connectOrCreate: {
            //   where: {
            //     slug: categorySlug,
            //   },
            //   create: {
            //     name: categoryName,
            //     slug: categorySlug,
            //   },
            // },
            set: [],
            connect: category.map((slug) => ({ slug })),
          },
        },
      });

      return { success: true };
    }

    await this.prisma.shop.update({
      where: { id: shop.id },
      data: {
        name,
        address,
      },
    });

    return { success: true };
  }

  async deleteShop(
    { id }: DeleteShopDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) throw new NotFoundException('Shop not found...');

    if (shop.ownerId !== ownerId)
      throw new ForbiddenException(
        'You have no permission to delete the shop...',
      );

    await this.prisma.shop.delete({ where: { id } });
    return { success: true };
  }

  async getShops({
    page,
    slug,
    search,
  }: GetShopsDto): Promise<ShopsQueryOutput> {
    try {
      if (slug) {
        const [data, totalItems] = await this.prisma.$transaction([
          this.prisma.shop.findMany({
            skip: (page - 1) * 10,
            take: 10,
            // FIXME:
            orderBy: { isPromoted: 'desc' },
            include: { categories: true },
            where: {
              categories: {
                some: { slug: { contains: slug, mode: 'insensitive' } },
              },
            },
          }),
          this.prisma.shop.count({
            where: {
              categories: {
                some: { slug: { contains: slug, mode: 'insensitive' } },
              },
            },
          }),
        ]);
        return {
          success: true,
          data,
          totalItems,
          totalPages: Math.ceil(totalItems / 10),
        };
      } else if (search) {
        const [data, totalItems] = await this.prisma.$transaction([
          this.prisma.shop.findMany({
            skip: (page - 1) * 10,
            take: 10,
            // FIXME:
            orderBy: { isPromoted: 'desc' },
            include: { categories: true },
            where: { name: { contains: search, mode: 'insensitive' } },
          }),
          this.prisma.shop.count({
            where: { name: { contains: search, mode: 'insensitive' } },
          }),
        ]);
        return {
          success: true,
          data,
          totalItems,
          totalPages: Math.ceil(totalItems / 10),
        };
      } else {
        const [data, totalItems] = await this.prisma.$transaction([
          this.prisma.shop.findMany({
            skip: (page - 1) * 10,
            take: 10,
            // FIXME:
            orderBy: { isPromoted: 'desc' },
            include: { categories: true },
          }),
          this.prisma.shop.count(),
        ]);
        return {
          success: true,
          data,
          totalItems,
          totalPages: Math.ceil(totalItems / 10),
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }

  async getShopById({ id }: GetShopByIdDto): Promise<ShopQueryOutput> {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: { products: true, categories: true },
    });

    if (!shop) throw new NotFoundException('Shop not found...');

    return {
      success: true,
      data: shop,
    };
  }

  async getShopByName({
    query,
    page,
  }: GetShopByNameDto): Promise<ShopsQueryOutput> {
    try {
      const [data, totalItems] = await this.prisma.$transaction([
        this.prisma.shop.findMany({
          where: { name: { contains: query.trim().toLocaleLowerCase() } },
          take: 10,
          skip: (page - 1) * 10,
          include: { categories: true },
        }),
        this.prisma.shop.count({
          where: { name: { contains: query.trim().toLocaleLowerCase() } },
        }),
      ]);

      return {
        success: true,
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / 10),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }

  async getOwnerShops(id: number): Promise<ShopsQueryOutput> {
    try {
      const data = await this.prisma.shop.findMany({
        where: { ownerId: id },
        include: { categories: true },
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, try again later...',
      );
    }
  }

  async getOwnerIndividualShop(
    ownerId: number,
    { id }: GetOwnerIndividualShopDto,
  ): Promise<ShopQueryOutput> {
    const shop = await this.prisma.shop.findFirst({
      where: { id, ownerId },
      include: { products: true, categories: true },
    });

    if (!shop) throw new NotFoundException('Shop not found...');

    return {
      success: true,
      data: shop,
    };
  }

  async getPromotedShops(): Promise<ShopsQueryOutput> {
    const shops = await this.prisma.shop.findMany({
      where: { isPromoted: true },
      include: { categories: true },
    });

    return { success: true, data: shops };
  }
}
