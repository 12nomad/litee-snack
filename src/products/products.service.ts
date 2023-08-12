import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { EditProductDto } from './dtos/edit-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(
    { description, name, price, shopId, options, image }: CreateProductDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) throw new NotFoundException('Shop not found...');

    if (shop.ownerId !== ownerId)
      throw new ForbiddenException(
        'You have no permission to create a dish inside this shop...',
      );

    const productExists = await this.prisma.product.findUnique({
      where: { name },
    });

    if (productExists)
      throw new ForbiddenException(
        'Dish wish the provided name already exists, please choose another one...',
      );

    if (options && Array.isArray(options) && options.length > 0) {
      const json = [...options] as Prisma.JsonArray;
      await this.prisma.product.create({
        data: { name, description, price, shopId, image, options: json },
      });
    } else {
      await this.prisma.product.create({
        data: { name, description, price, shopId, image },
      });
    }

    return { success: true };
  }

  async deleteProduct(
    { id }: DeleteProductDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { shop: { select: { ownerId: true } } },
    });

    if (!product) throw new NotFoundException('Dish not found...');

    if (product.shop.ownerId !== ownerId)
      throw new ForbiddenException(
        'You have no permission to delete a dish inside this shop...',
      );

    await this.prisma.product.delete({ where: { id } });

    return { success: true };
  }

  async editProduct(
    { description, productId, name, options, price }: EditProductDto,
    ownerId: number,
  ): Promise<MutationOutput> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { shop: { select: { ownerId: true } } },
    });

    if (!product) throw new NotFoundException('Dish not found...');

    if (product.shop.ownerId !== ownerId)
      throw new ForbiddenException(
        'You have no permission to edit a dish inside this shop...',
      );

    if (options && Array.isArray(options) && options.length > 0) {
      const json = [...options] as Prisma.JsonArray;
      await this.prisma.product.update({
        where: { id: productId },
        data: { name, price, description, options: json },
      });
    } else {
      await this.prisma.product.update({
        where: { id: productId },
        data: { name, price, description },
      });
    }

    return { success: true };
  }
}
